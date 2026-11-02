// lightTestApp — prova della luce sempre accesa (Fase 2 di HANDOFF.md).
//
// Idea: il firmware accende la luce per ~5 s a ogni doppio tocco sul vetro.
// L'app simula un doppio tocco (evento utente 'double_tap', lo stesso trucco del
// quadrante di Gadgetbridge) e lo ripete con un timer prima che la luce si spenga.
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

    versione: 'v1',
    intervalli: [2000, 3000, 4000, 6000],
    max_acceso: 120 * 60 * 1000,    // spegnimento di sicurezza dopo 2 ore

    luce: false,
    indice_intervallo: 1,           // si parte da 3 s
    modo: 'A',                      // A: un doppio tocco per giro, B: due di fila
    invii: 0,                       // doppi tocchi simulati
    tap_ricevuti: 0,                // eventi double_tap arrivati all'app
    stati: '',                      // ultimi stati da system_state_update (v, h, b)
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
    invia_tocchi: function (response) {
        response.emulate_double_tap();
        this.invii++;
        if (this.modo === 'B') {
            response.emulate_double_tap();
            this.invii++;
        }
    },
    avvia_timer: function () {
        stop_timer(this.node_name, 'luce');
        start_timer(this.node_name, 'luce', this.intervalli[this.indice_intervallo]);
    },
    accendi: function (response) {
        this.luce = true;
        this.acceso_da = now();
        this.batteria_iniziale = this.leggi('battery_soc');
        this.invia_tocchi(response);
        this.avvia_timer();
    },
    spegni: function () {
        this.luce = false;
        stop_timer(this.node_name, 'luce');
    },
    disegna: function (response, completo) {
        var batteria = this.leggi('battery_soc');
        var fuori_polso = this.leggi('device_offwrist');
        var polso = fuori_polso === 'true' ? 'no' : (fuori_polso === 'false' ? 'si' : '?');
        response.draw_screen(this.node_name, completo, {
            json_file: 'luce_layout',
            r0: 'Luce test ' + this.versione,
            r1: (this.luce ? 'LUCE ON' : 'LUCE OFF') + '  modo ' + this.modo,
            r2: 'ogni ' + (this.intervalli[this.indice_intervallo] / 1000) + 's  invii ' + this.invii,
            r3: 'stati ' + (this.stati || '-') + '  tap ' + this.tap_ricevuti,
            r4: this.luce
                ? 'da ' + Math.floor((now() - this.acceso_da) / 60000) + ' min  batt ' + this.batteria_iniziale + '>' + batteria
                : 'spenta  batt ' + batteria,
            r5: 'hr ' + this.leggi('hr_bpm') + '  rip ' + this.leggi('hr_bpm_resting'),
            r6: 'sonno ' + this.leggi('total_sleep') + '  polso ' + polso,
            r7: this.leggi('firmware_version')
        });
    },

    // Eventi validi in ogni stato, anche con l'app in background.
    handle_global_event: function (self, state_machine, event, response) {
        if (event.type === 'system_state_update' && event.concerns_this_app === true) {
            self.stati = (self.stati + event.new_state.charAt(0)).slice(-8);
            if (event.new_state === 'visible') {
                state_machine.set_current_state('schermo');
            } else {
                state_machine.set_current_state('background');
            }
        } else if (event.type === 'timer_expired' && is_this_timer_expired(event, self.node_name, 'luce')) {
            if (!self.luce) return;
            if (now() - self.acceso_da > self.max_acceso) {
                self.spegni();
                if (state_machine.get_current_state() === 'schermo') self.disegna(response, false);
                return;
            }
            self.invia_tocchi(response);
            self.avvia_timer();
        } else if (event.type === 'double_tap') {
            self.tap_ricevuti++;
        } else if (event.type === 'middle_hold') {
            // Luce accesa: l'app resta in background e il timer continua (si
            // prova così se la luce resta accesa anche sul quadrante).
            response.go_home(!self.luce);
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
                        self.indice_intervallo = (self.indice_intervallo + 1) % self.intervalli.length;
                        if (self.luce) self.avvia_timer();
                        self.disegna(response, false);
                    } else if (tipo === 'bottom_hold') {
                        self.modo = self.modo === 'A' ? 'B' : 'A';
                        self.disegna(response, false);
                    } else if (tipo === 'middle_short_press_release') {
                        // Un solo doppio tocco, qualunque sia il modo: dice cosa fa
                        // un tocco simulato mentre la luce è già accesa.
                        response.emulate_double_tap();
                        self.invii++;
                        self.disegna(response, false);
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
