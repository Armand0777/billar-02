export interface ReceiptData {
  tipo: "mesa" | "directa";
  mesaNumero?: number;
  cajero: string;
  cliente?: string;
  tiempo?: {
    horas: string;
    costo: number;
    tarifaNombre?: string;
  };
  productos: {
    nombre: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }[];
  totalGeneral: number;
  metodoPago: string;
}

export function printReceipt(data: ReceiptData) {
  const dateStr = new Date().toLocaleString("es-BO");
  const logoUrl = "/logo_transparente.png"; // Se asume que el logo est en public/logo_transparente.png

  let timeSection = "";
  if (data.tipo === "mesa" && data.tiempo) {
    timeSection = `
      <div class="divider"></div>
      <div class="row">
        <span>Tiempo (${data.tiempo.tarifaNombre || "Normal"})</span>
      </div>
      <div class="row text-sm">
        <span>${data.tiempo.horas} hrs</span>
        <span>Bs. ${data.tiempo.costo.toFixed(2)}</span>
      </div>
    `;
  }

  let productsSection = "";
  if (data.productos.length > 0) {
    productsSection = `
      <div class="divider"></div>
      <div class="row">
        <strong>Productos</strong>
      </div>
      ${data.productos.map(p => `
        <div class="row text-sm">
          <span>${p.cantidad}x ${p.nombre}</span>
          <span>Bs. ${p.subtotal.toFixed(2)}</span>
        </div>
      `).join('')}
    `;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Ticket de Venta</title>
      <style>
        @page { margin: 0; size: auto; }
        body { 
          font-family: 'Courier New', Courier, monospace; 
          margin: 0; 
          padding: 10px; 
          width: 80mm; /* Ancho estndar de ticketera */
          color: #000;
        }
        .ticket { width: 100%; max-width: 80mm; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 10px; }
        .header img { max-width: 60px; margin-bottom: 5px; }
        .header h1 { font-size: 16px; margin: 0; padding: 0; font-weight: bold; text-transform: uppercase; }
        .header p { font-size: 12px; margin: 2px 0; }
        .divider { border-top: 1px dashed #000; margin: 5px 0; }
        .row { display: flex; justify-content: space-between; margin: 2px 0; font-size: 13px; }
        .text-sm { font-size: 11px; }
        .total-row { font-size: 16px; font-weight: bold; margin-top: 5px; }
        .footer { text-align: center; font-size: 10px; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="ticket">
        <div class="header">
          <!-- <img src="${logoUrl}" alt="Logo" /> -->
          <h1>LA BILLANGA</h1>
          <p>Ticket de Consumo</p>
          <p>${dateStr}</p>
        </div>
        
        <div class="divider"></div>
        <div class="row text-sm">
          <span>Tipo:</span>
          <span>${data.tipo === "mesa" ? "Uso de Mesa" : "Venta Directa"}</span>
        </div>
        ${data.tipo === "mesa" ? `
        <div class="row text-sm">
          <span>Mesa:</span>
          <span>#${data.mesaNumero}</span>
        </div>
        ` : ''}
        ${data.cliente ? `
        <div class="row text-sm">
          <span>Cliente:</span>
          <span>${data.cliente}</span>
        </div>
        ` : ''}
        <div class="row text-sm">
          <span>Atendido por:</span>
          <span>${data.cajero}</span>
        </div>

        ${timeSection}
        ${productsSection}

        <div class="divider"></div>
        <div class="row total-row">
          <span>TOTAL A PAGAR</span>
          <span>Bs. ${data.totalGeneral.toFixed(2)}</span>
        </div>
        <div class="row text-sm">
          <span>Metodo Pago:</span>
          <span style="text-transform: capitalize;">${data.metodoPago}</span>
        </div>

        <div class="divider"></div>
        <div class="footer">
          <p>Gracias por su preferencia!</p>
          <p>Vuelva pronto</p>
        </div>
      </div>
      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() { window.close(); }, 500);
        }
      </script>
    </body>
    </html>
  `;

  // Abrir ventana oculta para imprimir
  const printWindow = window.open('', '_blank', 'width=400,height=600');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}
