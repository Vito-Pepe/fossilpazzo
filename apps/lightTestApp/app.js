// lightTestApp — prova della luce sempre accesa (Fase 2 di HANDOFF.md).
//
// Idea: il firmware accende la luce per ~5 s a ogni doppio tocco sul vetro.
// L'app simula un doppio tocco (evento utente 'double_tap', lo stesso trucco del
// quadrante di Gadgetbridge) e lo ripete con un timer prima che la luce si spenga.
//
// v2, dopo la prova della v1 (reports/prova-luce-v1.md): la luce resta fissa con
// un tocco ogni 2 s, e resta accesa anche fuori dall'app; però, uscendo con
// go_home(false), l'app risultava 'hidden' e non si riusciva più a tornare al
// quadrante. Ora i tasti si gestiscono solo con l'app in primo piano e si può
// scegliere come uscire: al menu con go_back(false), come l'app Timer che resta
// attiva in background, oppure al quadrante come la v1.
//
// JerryScript 2.1.0 = ES5: solo var e function. Il file non è un modulo ma il
// corpo di una funzione che restituisce l'oggetto app; il firmware chiama init()
// una volta e poi handler(event, response) per ogni evento. Per reagire si
// riempie l'oggetto response (draw, move, action, i), non si chiama un'API.
return {
    node_name: '',
    manifest: {
        timers: ['luce']
    },
    persist: {},
    config: {},

    versione: 'v2',
    intervallo: 2000,               // con 2 s la luce resta fissa (prova della v1)

    luce: false,
    uscita_menu: true,              // centro tenuto: true torna al menu, false al quadrante
    sfondo_bianco: false,
    invii: 0,                       // doppi tocchi simulati
    stati: '',                      // ultimi stati da system_state_update (v, h, b)
    tasti_fuori: 0,                 // tasti arrivati all'app mentre non era in primo piano
    ultimo_fuori: '',
    acceso_da: 0,                   // now() all'accensione, in ms dall'avvio dell'orologio
    batteria_iniziale: '?',

    handler: function (event, response) {
        this.wrap_event(event);
        this.wrap_response(response);
        this.state_machine.handle_event(event, response);
    },
    wrap_event: function (system_state_update_event) {
        if (system_state_update_event.type === 'system_state_update') {
            system_state_update_event.concerns_this_app = system_state_update_event.de;
            system_state_update_event.old_state = system_state_update_event.ze;
            system_state_update_event.new_state = system_state_update_event.le;
        }
        return system_state_update_event;
    },
    wrap_response: function (response) {
        response.move_hands = function (degrees_hour, degrees_minute, relative) {
            response.move = {
                h: degrees_hour,
                m: degrees_minute,
                is_relative: relative
            };
        };
        response.go_back = function (kill_app) {
            response.action = {
                type: 'go_back',
                Se: kill_app
            };
        };
        response.go_home = function (kill_app) {
            response.action = {
                type: 'go_home',
                Se: kill_app
            };
        };
        response.draw_screen = function (node_name, full_update, layout_info) {
            response.draw = {
                update_type: full_update ? 'gc4' : 'du4'
            };
            response.draw[node_name] = {
                layout_function: 'layout_parser_json',
                layout_info: layout_info
            };
        };
        response.send_user_class_event = function (event_type) {
            response.send_generic_event({
                type: event_type,
                class: 'user'
            });
        };
        response.emulate_double_tap = function () {
            this.send_user_class_event('double_tap');
        };
        response.send_generic_event = function (event_object) {
            if (response.i == undefined) response.i = [];
            response.i.push(event_object);
        };
        return response;
    },
    wrap_state_machine: function (state_machine) {
        state_machine.set_current_state = state_machine.d;
        state_machine.handle_event = state_machine._;
        state_machine.get_current_state = function () {
            return state_machine.n;
        };
        return state_machine;
    },

    // Dati di sistema: get_common() sui firmware recenti (lo usa il quadrante di
    // Gadgetbridge), la variabile globale common su quelli vecchi. Mai un errore:
    // un'eccezione non gestita potrebbe chiudere l'app.
    leggi: function (campo) {
        try {
            var dati = (typeof get_common === 'function') ? get_common() : common;
            var valore = dati[campo];
            return valore === undefined ? '?' : String(valore);
        } catch (e) {
            return '?';
        }
    },
    // 'middle_hold' -> 'centro tenuto'; undefined se l'evento non è un tasto.
    // Niente espressioni regolari: non è detto che il firmware le abbia.
    nome_tasto: function (tipo) {
        var tasti = { top: 'alto', middle: 'centro', bottom: 'basso' };
        var azioni = { press: 'giu', short_press_release: 'corto', hold: 'tenuto', long_press_release: 'lungo' };
        var i = typeof tipo === 'string' ? tipo.indexOf('_') : -1;
        if (i < 0 || !tasti.hasOwnProperty(tipo.substring(0, i))) return undefined;
        var azione = tipo.substring(i + 1);
        return tasti[tipo.substring(0, i)] + ' ' + (azioni.hasOwnProperty(azione) ? azioni[azione] : azione);
    },
    avvia_timer: function () {
        stop_timer(this.node_name, 'luce');
        start_timer(this.node_name, 'luce', this.intervallo);
    },
    accendi: function (response) {
        this.luce = true;
        this.acceso_da = now();
        this.batteria_iniziale = this.leggi('battery_soc');
        response.emulate_double_tap();
        this.invii++;
        this.avvia_timer();
    },
    spegni: function () {
        this.luce = false;
        stop_timer(this.node_name, 'luce');
    },
    esci: function (response) {
        // Luce accesa: l'app resta attiva in background e il timer continua.
        var chiudi = !this.luce;
        if (this.uscita_menu) {
            response.go_back(chiudi);
        } else {
            response.go_home(chiudi);
        }
    },
    disegna: function (response, completo) {
        var batteria = this.leggi('battery_soc');
        response.draw_screen(this.node_name, completo, {
            json_file: 'luce_layout',
            inverti: this.sfondo_bianco,
            r0: 'Luce test ' + this.versione,
            r1: this.luce ? 'LUCE ON' : 'LUCE OFF',
            r2: 'uscita: ' + (this.uscita_menu ? 'menu' : 'quadrante'),
            r3: 'stati ' + (this.stati || '-'),
            r4: this.luce
                ? 'da ' + Math.floor((now() - this.acceso_da) / 60000) + ' min  batt ' + this.batteria_iniziale + '>' + batteria
                : 'batt ' + batteria,
            r5: 'invii ' + this.invii,
            r6: 'fuori ' + this.tasti_fuori + (this.ultimo_fuori ? ': ' + this.ultimo_fuori : ''),
            r7: 'sonno ' + this.leggi('total_sleep') + '  hr ' + this.leggi('hr_bpm')
        });
    },

    // Eventi validi in ogni stato, anche con l'app in background.
    handle_global_event: function (self, state_machine, event, response) {
        var tasto = self.nome_tasto(event.type);
        if (event.type === 'system_state_update' && event.concerns_this_app === true) {
            self.stati = (self.stati + event.new_state.charAt(0)).slice(-8);
            if (event.new_state === 'visible') {
                state_machine.set_current_state('schermo');
            } else {
                state_machine.set_current_state('background');
            }
        } else if (event.type === 'timer_expired' && is_this_timer_expired(event, self.node_name, 'luce')) {
            if (!self.luce) return;
            response.emulate_double_tap();
            self.invii++;
            self.avvia_timer();
        } else if (tasto && state_machine.get_current_state() !== 'schermo') {
            // Fuori dall'app i tasti non sono nostri: non si risponde, si contano
            // soltanto (dice se il firmware li manda anche a un'app non visibile).
            self.tasti_fuori++;
            self.ultimo_fuori = tasto;
        }
    },
    handle_state_specific_event: function (state, state_phase) {
        if (state === 'schermo') {
            if (state_phase === 'entry') {
                return function (self, response) {
                    response.move_hands(270, 90, false);    // lancette orizzontali, al centro c'è una riga vuota
                    self.disegna(response, true);
                };
            }
            if (state_phase === 'during') {
                return function (self, state_machine, event, response) {
                    var tipo = event.type;
                    if (tipo === 'top_short_press_release') {
                        if (self.luce) {
                            self.spegni();
                        } else {
                            self.accendi(response);
                        }
                        self.disegna(response, false);
                    } else if (tipo === 'bottom_short_press_release') {
                        self.sfondo_bianco = !self.sfondo_bianco;
                        self.disegna(response, true);
                    } else if (tipo === 'bottom_hold') {
                        self.uscita_menu = !self.uscita_menu;
                        self.disegna(response, false);
                    } else if (tipo === 'middle_hold') {
                        self.esci(response);
                    }
                };
            }
        }
        return undefined;
    },
    init: function () {
        this.state_machine = new state_machine(
            this,
            this.handle_global_event,
            this.handle_state_specific_event,
            undefined,
            'background'
        );
        this.wrap_state_machine(this.state_machine);
    }
};
