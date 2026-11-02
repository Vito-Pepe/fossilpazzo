// Scenario di prova di lightTestApp: bash strumenti/prova.sh apps/lightTestApp

var r = avvia(app, 'lightTestApp');
verifica(r.draw && r.draw.update_type === 'gc4', 'all\'apertura disegna lo schermo intero');
verifica(r.move && r.move.h === 270 && r.move.m === 90, 'lancette orizzontali');
verifica(r.draw.lightTestApp.layout_info.r1 === 'LUCE OFF  modo A', 'parte con la luce spenta');

r = premi(app, 'top_short_press_release');
verifica(conta(r, 'double_tap') === 1, 'in alto: accende e manda subito un doppio tocco');
verifica(SIM.timer.luce === 3000, 'timer della luce a 3 s');

r = scatta(app, 'luce');
verifica(conta(r, 'double_tap') === 1 && SIM.timer.luce === 3000, 'allo scadere ripete il tocco e riparte');
verifica(!r.draw, 'il timer non ridisegna (niente sfarfallio dell\'e-ink)');

r = premi(app, 'bottom_short_press_release');
verifica(SIM.timer.luce === 4000, 'in basso: intervallo a 4 s, timer rifatto');
premi(app, 'bottom_short_press_release');
r = premi(app, 'bottom_short_press_release');
verifica(SIM.timer.luce === 2000 && r.draw.lightTestApp.layout_info.r2.indexOf('ogni 2s') === 0, 'gli intervalli girano: 6 s poi 2 s');

r = premi(app, 'bottom_hold');
verifica(r.draw.lightTestApp.layout_info.r1 === 'LUCE ON  modo B', 'in basso tenuto: modo B');
r = scatta(app, 'luce');
verifica(conta(r, 'double_tap') === 2, 'modo B: due tocchi per giro');

r = premi(app, 'middle_short_press_release');
verifica(conta(r, 'double_tap') === 1, 'al centro: un solo tocco anche in modo B');

premi(app, 'double_tap');
r = premi(app, 'middle_hold');
verifica(r.action && r.action.type === 'go_home' && r.action.Se === false, 'centro tenuto con la luce accesa: esce senza chiudere');

cambia_stato(app, 'visible', 'background');
r = scatta(app, 'luce');
verifica(conta(r, 'double_tap') === 2 && !r.draw, 'in background continua a mandare tocchi senza disegnare');

r = cambia_stato(app, 'background', 'visible');
verifica(r.draw.lightTestApp.layout_info.r3 === 'stati vbv  tap 1', 'al ritorno mostra gli stati e i tocchi ricevuti');
print('      schermo dopo il ritorno:');
righe(r, 'lightTestApp');

SIM.ora += 121 * 60 * 1000;
r = scatta(app, 'luce');
verifica(conta(r, 'double_tap') === 0 && !('luce' in SIM.timer), 'dopo 2 ore si spegne da sola');
verifica(r.draw.lightTestApp.layout_info.r1 === 'LUCE OFF  modo B', 'e lo mostra');

r = premi(app, 'middle_hold');
verifica(r.action.Se === true, 'centro tenuto con la luce spenta: chiude l\'app');

SIM.comune = undefined;
r = cambia_stato(app, 'background', 'visible');
verifica(r.draw.lightTestApp.layout_info.r5 === 'hr ?  rip ?', 'senza dati di sistema mostra ? invece di bloccarsi');

print('Tutte le prove passate.');
