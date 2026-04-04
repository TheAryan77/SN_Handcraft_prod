"use client";

type InvoiceActionsProps = {
  invoiceNumber: string;
  orderId: string;
  issuedOn: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
};

export default function InvoiceActions(props: InvoiceActionsProps) {
  function downloadSlip() {
    const slipHtml = `
      <html>
        <head>
          <title>Invoice - ${props.invoiceNumber}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
            h1 { color: #7c3d1e; font-size: 28px; border-bottom: 2px solid #eee; padding-bottom: 10px; }
            .header { margin-bottom: 30px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { text-align: left; padding: 12px; border-bottom: 1px solid #ddd; }
            th { background-color: #f8f5f2; color: #7c3d1e; }
            .total { font-size: 20px; font-weight: bold; text-align: right; margin-top: 20px; color: #7c3d1e; }
            .footer-note { margin-top: 40px; text-align: center; color: #888; font-size: 14px; }
          </style>
        </head>
        <body>
          <h1>SN HandCrafts</h1>
          <div class="row">
            <div>
              <strong>Order ID:</strong> ${props.orderId}<br/>
              <strong>Date:</strong> ${props.issuedOn}
            </div>
            <div style="text-align: right;">
              <strong>Invoice No:</strong> ${props.invoiceNumber}
            </div>
          </div>
          
          <div class="header">
            <h3>Bill To:</h3>
            <p>
              <strong>${props.customerName}</strong><br/>
              ${props.customerEmail}<br/>
              ${props.shippingAddress.replace(/\n/g, '<br/>')}
            </p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${props.items
                .map(
                  (item) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.unitPrice.toFixed(2)}</td>
                  <td>₹${item.lineTotal.toFixed(2)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="total">
            Grand Total: ₹${props.total.toFixed(2)}
          </div>
          
          <div class="footer-note">
            Thank you for shopping with SN HandCrafts.<br/>
            This is a computer generated invoice and does not require a signature.
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(slipHtml);
      printWindow.document.close();
    }
  }

  return (
    <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
      <button type="button" className="btn-secondary" onClick={() => window.print()}>
        Print Invoice
      </button>
      <button type="button" className="btn-primary" onClick={downloadSlip}>
        Download Slip
      </button>
    </div>
  );
}
