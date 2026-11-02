// Simulatore minimo del firmware per provare un'app con jerry (JerryScript 2.1.0,
// lo stesso motore dell'orologio). Lo usa strumenti/prova.sh: prima questo file,
// poi LAYOUTS (i layout dell'app), poi `var app = (function () { <app.js> })();`,
// poi lo scenario apps/<nome>/prova.js.
//
// Le API imitano quelle usate dagli esempi dell'SDK e dalle app di Gadgetbridge.
// La state machine del firmware non è documentata: qui la si ricostruisce dal
// modo in cui la usano gli esempi (d = cambia stato, _ = gestisci evento, n = stato).

var SIM = {
    ora: 1000,          // ms dall'avvio dell'orologio, restituiti da now()
    timer: {},          // nome -> durata in ms dei timer attivi
    comune: {
        hr_bpm: 62,
        hr_bpm_resting: 55,
        total_sleep: 0,
        device_offwrist: false,
        battery_soc: 71,
        firmware_version: 'DN1.0.3.0r.v13',
        app_status: 'connected'
    }
};

function now() { return SIM.ora; }
function get_unix_time() { return 1793000000 + Math.floor(SIM.ora / 1000); }
function start_timer(node_name, nome, ms) { SIM.timer[nome] = ms; }
function stop_timer(node_name, nome) { delete SIM.timer[nome]; }
function is_this_timer_expired(event, node_name, nome) {
    return event.type === 'timer_expired' && event.timer_name === nome;
}
function get_common() { return SIM.comune; }
var common = SIM.comune;
function req_data() {}
function save_node_persist() {}
function enable_time_telling() { return { hour_pos: 0, minute_pos: 0 }; }
function disable_time_telling() {}
function localization_snprintf(formato) { return formato; }

function state_machine(self, gestore_globale, gestore_stati, ignoto, stato_iniziale) {
    this.self = self;
    this.g = gestore_globale;
    this.h = gestore_stati;
    this.n = stato_iniziale;
    this.risposta = undefined;
}
state_machine.prototype._ = function (event, response) {
    this.risposta = response;
    this.g(this.self, this, event, response);
    var durante = this.h(this.n, 'during');
    if (durante) durante(this.self, this, event, response);
};
state_machine.prototype.d = function (nuovo) {
    var uscita = this.h(this.n, 'exit');
    if (uscita) uscita(this.self, this.risposta);
    this.n = nuovo;
    var entrata = this.h(nuovo, 'entry');
    if (entrata) entrata(this.self, this.risposta);
};
state_machine.prototype.c = function () {};

// --- Aiuti per gli scenari ---

function verifica(condizione, descrizione) {
    if (!condizione) throw new Error('FALLITO: ' + descrizione);
    print('ok    ' + descrizione);
}

// Ogni segnaposto "#nome" del layout deve avere un valore in layout_info.
function controlla_disegno(risposta) {
    if (!risposta.draw) return;
    Object.keys(risposta.draw).forEach(function (nodo) {
        if (nodo === 'update_type') return;
        var info = risposta.draw[nodo].layout_info;
        var layout = LAYOUTS[info.json_file];
        if (!layout) throw new Error('FALLITO: layout inesistente ' + info.json_file);
        layout.forEach(function (elemento) {
            Object.keys(elemento).forEach(function (chiave) {
                var v = elemento[chiave];
                if (typeof v === 'string' && v.charAt(0) === '#') {
                    var nome = v.substring(1);
                    if (info[nome] === undefined) throw new Error('FALLITO: manca ' + nome + ' per ' + info.json_file);
                }
            });
        });
    });
}

function evento(app, ev) {
    var risposta = {};
    app.handler(ev, risposta);
    controlla_disegno(risposta);
    return risposta;
}
function avvia(app, nome) {
    app.node_name = nome;
    app.init();
    return evento(app, { type: 'system_state_update', de: true, ze: 'background', le: 'visible' });
}
function cambia_stato(app, da, a) {
    return evento(app, { type: 'system_state_update', de: true, ze: da, le: a });
}
function premi(app, tipo) {
    return evento(app, { type: tipo, class: 'user' });
}
// Fa scadere il timer: avanza l'orologio della sua durata e manda timer_expired.
function scatta(app, nome) {
    if (!(nome in SIM.timer)) throw new Error('FALLITO: timer non attivo ' + nome);
    SIM.ora += SIM.timer[nome];
    delete SIM.timer[nome];
    return evento(app, { type: 'timer_expired', timer_name: nome });
}
function conta(risposta, tipo) {
    var n = 0;
    (risposta.i || []).forEach(function (e) { if (e.type === tipo) n++; });
    return n;
}
function righe(risposta, nodo) {
    var info = risposta.draw[nodo].layout_info;
    var testo = [];
    Object.keys(info).forEach(function (k) {
        if (k !== 'json_file') testo.push('      ' + k + ' | ' + info[k]);
    });
    print(testo.join('\n'));
}
