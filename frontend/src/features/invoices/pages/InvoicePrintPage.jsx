import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost/invoice-billing-portal/backend/routes/api.php';

// Number to Words Converter (Indian Numbering System)
function numberToWords(num) {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if ((num = num.toString()).length > 9) return 'overflow';
  let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return;
  let str = '';
  str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) + 'Only' : 'Only';
  return str.trim();
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
}

function formatDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}-${month}-${year}`;
}

function InvoicePrintPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [businessProfile, setBusinessProfile] = useState(null);
  const [client, setClient] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch Invoice
        const invRes = await fetch(`${API_BASE}?route=invoices&id=${id}`, { credentials: 'include' });
        const invData = await invRes.json();
        if (!invData.success) throw new Error(invData.message);
        const inv = invData.data;
        setInvoice(inv);

        // Fetch Client
        const cliRes = await fetch(`${API_BASE}?route=clients&id=${inv.client_id}`, { credentials: 'include' });
        const cliData = await cliRes.json();
        if (cliData.success) setClient(cliData.data);

        // Fetch Active Profile
        const profRes = await fetch(`${API_BASE}?route=profiles/active`, { credentials: 'include' });
        const profData = await profRes.json();
        if (profData.success) setBusinessProfile(profData.data.profile);

        // Fetch Payments
        const payRes = await fetch(`${API_BASE}?route=payments&invoice_id=${id}`, { credentials: 'include' });
        const payData = await payRes.json();
        if (payData.success) setPayments(payData.data.payments || []);

      } catch (err) {
        setError(err.message || 'Failed to load invoice details.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const { taxBreakdown, totalPaid } = useMemo(() => {
    if (!invoice || !invoice.items) return { taxBreakdown: {}, totalPaid: 0 };
    
    const taxes = {};
    invoice.items.forEach(item => {
      const taxPercent = Number(item.tax_percent || 0);
      if (taxPercent > 0) {
        const base = Number(item.quantity) * Number(item.unit_price);
        const taxAmt = (base * taxPercent) / 100;
        taxes[taxPercent] = (taxes[taxPercent] || 0) + taxAmt;
      }
    });

    const paid = payments.reduce((sum, p) => sum + Number(p.amount_paid), 0);

    return { taxBreakdown: taxes, totalPaid: paid };
  }, [invoice, payments]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading Invoice Print View...</div>;
  }

  if (error || !invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <p className="text-rose-600">{error || 'Invoice not found'}</p>
        <button onClick={() => navigate('/invoices')} className="px-4 py-2 bg-slate-900 text-white rounded">Back to Invoices</button>
      </div>
    );
  }

  const balanceDue = Math.max(0, Number(invoice.total_amount) - totalPaid);
  const paymentModes = [...new Set(payments.map(p => p.payment_method))].join(', ') || '-';

  return (
    <div className="min-h-screen bg-slate-100 py-8 print:bg-white print:py-0 text-black">
      {/* Non-print controls */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between print:hidden">
        <button 
          onClick={() => navigate('/invoices')}
          className="px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 text-slate-700"
        >
          ← Back
        </button>
        <button 
          onClick={() => window.print()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 font-medium"
        >
          Print Invoice
        </button>
      </div>

      {/* Invoice Document */}
      <div className="max-w-4xl mx-auto bg-white border-2 border-black font-sans print:border-0 print:max-w-full">
        
        {/* Header Bar */}
        <div className="bg-[#1e3a5f] text-white flex justify-between items-center px-4 py-2">
          <div className="w-1/3"></div>
          <div className="w-1/3 text-center text-2xl font-bold tracking-wide">
            {businessProfile?.is_gst_registered ? 'TAX INVOICE' : 'INVOICE'}
          </div>
          <div className="w-1/3 text-right text-sm font-semibold">
            <p>INVOICE NO : {invoice.invoice_number}</p>
            <p>DATE : {formatDate(invoice.invoice_date)}</p>
          </div>
        </div>

        {/* Business Info */}
        <div className="text-center py-4 border-b-2 border-black">
          <h1 className="text-3xl font-extrabold uppercase mb-1">
            {businessProfile?.business_name || 'BUSINESS NAME'}
          </h1>
          <p className="text-sm font-medium">
            {businessProfile?.address || 'Business Address'}
          </p>
          {businessProfile?.is_gst_registered && businessProfile?.tax_number && (
            <p className="text-sm font-medium mt-1">GSTIN: {businessProfile.tax_number}</p>
          )}
          {businessProfile?.email && (
            <p className="text-sm font-medium">Email ID: {businessProfile.email}</p>
          )}
          {businessProfile?.pan_number && (
            <p className="text-sm font-medium">PAN NO. {businessProfile.pan_number}</p>
          )}
        </div>

        {/* Two Columns: Bill To & Payment Info */}
        <div className="flex border-b-2 border-black bg-[#e0f2fe] min-h-[140px]">
          {/* Bill To */}
          <div className="w-1/2 p-3 border-r-2 border-black">
            <h2 className="font-bold text-lg leading-tight mb-1">Bill To: {client?.client_name}</h2>
            {client?.company_name && (
              <p className="text-sm leading-tight font-medium uppercase">PARTY'S NAME - {client.company_name}</p>
            )}
            <p className="text-sm leading-tight font-medium">ADDRESS:</p>
            <p className="text-sm leading-tight font-medium">
              {[client?.address, client?.city, client?.state, client?.postal_code].filter(Boolean).join(', ')}
            </p>
            {client?.email && (
              <p className="text-sm leading-tight font-medium mt-1">Email ID: {client.email}</p>
            )}
            {/* If client has tax number, render it. Assuming it might be in notes or future schema */}
            {client?.notes && client.notes.includes('GSTIN:') && (
               <p className="text-sm leading-tight font-medium">{client.notes.split('\n').find(l => l.includes('GSTIN:'))}</p>
            )}
          </div>
          
          {/* Payment Info */}
          <div className="w-1/2 p-3 flex flex-col justify-center">
            <p className="text-sm font-medium mb-1">Payment Due Date: {formatDate(invoice.due_date)}</p>
            <p className="text-sm font-medium">Payment Mode: <span className="uppercase">{paymentModes}</span></p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-sm border-b-2 border-black">
          <thead>
            <tr className="border-b-2 border-black bg-white">
              <th className="p-2 text-left font-bold border-r-2 border-black">Description</th>
              {businessProfile?.is_gst_registered && <th className="p-2 text-center font-bold border-r-2 border-black w-24">HSN Code</th>}
              <th className="p-2 text-center font-bold border-r-2 border-black w-16">Qty</th>
              <th className="p-2 text-right font-bold border-r-2 border-black w-28">Rate</th>
              <th className="p-2 text-right font-bold w-32">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items && invoice.items.map((item, idx) => (
              <tr key={idx} className="align-top">
                <td className="p-2 border-r-2 border-black">
                  <div className="font-bold">{item.item_name}</div>
                  {item.description && <div className="text-xs text-gray-700">{item.description}</div>}
                </td>
                {businessProfile?.is_gst_registered && <td className="p-2 text-center border-r-2 border-black">{item.hsn_code || ''}</td>}
                <td className="p-2 text-center font-bold border-r-2 border-black">{Number(item.quantity)}</td>
                <td className="p-2 text-right text-gray-600 border-r-2 border-black">{formatCurrency(item.unit_price)}</td>
                <td className="p-2 text-right text-gray-600">{formatCurrency(Number(item.quantity) * Number(item.unit_price))}</td>
              </tr>
            ))}
            
            {/* Empty filler rows to make table tall if few items */}
            {invoice.items && invoice.items.length < 5 && Array(5 - invoice.items.length).fill(0).map((_, i) => (
               <tr key={`empty-${i}`} className="h-8">
                 <td className="border-r-2 border-black"></td>
                 {businessProfile?.is_gst_registered && <td className="border-r-2 border-black"></td>}
                 <td className="border-r-2 border-black"></td>
                 <td className="border-r-2 border-black"></td>
                 <td></td>
               </tr>
            ))}

            {/* Subtotal Row */}
            <tr className="border-t-2 border-black font-bold">
              <td className="p-2 text-right border-r-2 border-black" colSpan={businessProfile?.is_gst_registered ? 3 : 2}>Total</td>
              <td className="border-r-2 border-black"></td>
              <td className="p-2 text-right text-gray-700">{formatCurrency(invoice.subtotal)}</td>
            </tr>
          </tbody>
        </table>

        {/* Footer Two Columns */}
        <div className="flex border-b-2 border-black bg-[#e0f2fe]">
          {/* Terms & Conditions */}
          <div className="w-1/2 p-3 border-r-2 border-black">
            <h3 className="font-bold text-sm mb-1">Terms & conditions</h3>
            <ol className="list-decimal list-inside text-xs font-semibold leading-tight space-y-0.5">
              <li>Goods once sold will not be taken back.</li>
              <li>Interest @ 18% p.a. will be charged if payment is delayed.</li>
              <li>Subject to local jurisdiction.</li>
              <li>E. & O.E.</li>
            </ol>
            {invoice.notes && (
              <div className="mt-4 text-xs font-semibold">
                <p>Notes: {invoice.notes}</p>
              </div>
            )}
          </div>
          
          {/* Summary Box */}
          <div className="w-1/2 flex flex-col justify-between">
            <div className="p-2 space-y-1">
              {businessProfile?.is_gst_registered && Object.entries(taxBreakdown).map(([percent, amt]) => (
                <div key={percent} className="flex justify-between text-sm font-bold">
                  <span>Add : GST @ {percent}%</span>
                  <span>{formatCurrency(amt)}</span>
                </div>
              ))}
              {invoice.discount_amount > 0 && (
                 <div className="flex justify-between text-sm font-bold text-red-700">
                   <span>Less : Discount</span>
                   <span>- {formatCurrency(invoice.discount_amount)}</span>
                 </div>
              )}
              <div className="flex justify-between text-sm font-bold pt-2">
                <span>Balance Received :</span>
                <span>{totalPaid > 0 ? formatCurrency(totalPaid) : '-'}</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span>Balance Due :</span>
                <span>{balanceDue > 0 ? formatCurrency(balanceDue) : '-'}</span>
              </div>
            </div>
            
            <div className="bg-[#1e3a5f] text-white flex justify-between p-2 font-bold text-lg">
              <span>Grand Total</span>
              <span>{formatCurrency(invoice.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Bottom Total Words */}
        <div className="p-3 border-b-2 border-black">
          <p className="font-bold text-sm italic underline">Total Amount (₹ - In Words) :</p>
          <p className="font-bold text-sm capitalize mt-1">INR {numberToWords(Math.round(invoice.total_amount))}</p>
        </div>

        {/* Authorised Signatory */}
        <div className="h-32 p-3 flex flex-col justify-between relative">
          <p className="font-bold text-sm italic">For : {businessProfile?.business_name}</p>
          <p className="font-bold text-sm italic absolute bottom-3 left-3">Authorised Signatory</p>
        </div>
        
      </div>
    </div>
  );
}

export default InvoicePrintPage;
