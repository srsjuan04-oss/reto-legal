/**
 * Google Apps Script para recibir los envíos del formulario de
 * Landing Renta No Residentes y guardarlos como filas en esta hoja.
 *
 * INSTALACIÓN:
 * 1. Ve a https://sheets.google.com y crea una hoja de cálculo nueva
 *    (ej. "Leads Reto Tributario").
 * 2. Menú Extensiones > Apps Script.
 * 3. Borra el contenido de Code.gs y pega TODO este archivo.
 * 4. Guarda (icono de disco o Ctrl/Cmd+S).
 * 5. Implementar > Nueva implementación > selecciona tipo "Aplicación web".
 *      - Descripción: lo que quieras.
 *      - Ejecutar como: Yo (tu cuenta).
 *      - Quién tiene acceso: Cualquier usuario.
 * 6. Autoriza los permisos cuando te lo pida (es tu propio script).
 * 7. Copia la "URL de la aplicación web" que te da al final.
 * 8. Pégala en js/form.js, en la constante SHEETS_ENDPOINT_URL.
 *
 * Cada vez que alguien complete el formulario, se agregará una fila
 * nueva automáticamente con sus respuestas.
 */

var HEADERS = [
  "fecha", "nombre", "email", "whatsapp", "pais", "situacion", "dias",
  "bienes", "valor", "cuenta", "documentos", "estado", "urgencia",
  "ayuda", "contratar"
];

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  }

  var data = JSON.parse(e.postData.contents);
  var row = HEADERS.map(function (key) {
    return data[key] || "";
  });

  sheet.appendRow(row);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
