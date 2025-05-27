import jsPDF from 'jspdf';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  products?: {
    name: string;
    images?: string[];
  };
  product?: {
    name: string;
    images?: string[];
  };
}

interface Order {
  id: string;
  status: string;
  total: number;
  created_at: string;
  shipping_address: {
    name?: string;
    email?: string;
    address?: string;
    city?: string;
    postal_code?: string;
    phone?: string;
  };
  order_items?: OrderItem[];
}

export const generateInvoicePDF = (order: Order, orderItems?: OrderItem[]) => {
  const doc = new jsPDF();
  
  // Configuración de colores
  const primaryColor = [0, 0, 0]; // Negro
  const secondaryColor = [75, 85, 99]; // Gris
  const accentColor = [59, 130, 246]; // Azul
  
  // Título del documento
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.text('FACTURA', 20, 30);
  
  // Información de la empresa
  doc.setFontSize(12);
  doc.setTextColor(...secondaryColor);
  doc.text('DevHub CL', 140, 25);
  doc.text('www.devhub.cl', 140, 32);
  doc.text('contacto@devhub.com', 140, 39);
  doc.text('+56 9 1234 5678', 140, 46);
  
  // Línea divisoria
  doc.setLineWidth(0.5);
  doc.setDrawColor(...secondaryColor);
  doc.line(20, 55, 190, 55);
  
  // Información de la orden
  doc.setFontSize(14);
  doc.setTextColor(...primaryColor);
  doc.text('INFORMACIÓN DE LA ORDEN', 20, 70);
  
  doc.setFontSize(10);
  doc.setTextColor(...secondaryColor);
  doc.text(`Número de Orden: ${order.id}`, 20, 80);
  doc.text(`Fecha: ${new Date(order.created_at).toLocaleDateString('es-CL')}`, 20, 87);
  doc.text(`Estado: ${order.status}`, 20, 94);
  
  // Información del cliente
  doc.setFontSize(14);
  doc.setTextColor(...primaryColor);
  doc.text('INFORMACIÓN DEL CLIENTE', 20, 110);
  
  doc.setFontSize(10);
  doc.setTextColor(...secondaryColor);
  doc.text(`Nombre: ${order.shipping_address?.name || 'N/A'}`, 20, 120);
  doc.text(`Email: ${order.shipping_address?.email || 'N/A'}`, 20, 127);
  doc.text(`Teléfono: ${order.shipping_address?.phone || 'N/A'}`, 20, 134);
  
  // Dirección de envío
  doc.setFontSize(14);
  doc.setTextColor(...primaryColor);
  doc.text('DIRECCIÓN DE ENVÍO', 110, 110);
  
  doc.setFontSize(10);
  doc.setTextColor(...secondaryColor);
  doc.text(`${order.shipping_address?.address || 'N/A'}`, 110, 120);
  doc.text(`${order.shipping_address?.city || 'N/A'}`, 110, 127);
  doc.text(`${order.shipping_address?.postal_code || 'N/A'}`, 110, 134);
  
  // Tabla de productos
  const items = orderItems || order.order_items || [];
  if (items.length > 0) {
    // Encabezado de la tabla
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.text('DETALLE DE PRODUCTOS', 20, 155);
    
    // Línea de encabezado de tabla
    doc.setFillColor(...accentColor);
    doc.rect(20, 165, 170, 8, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('Producto', 22, 170);
    doc.text('Cantidad', 110, 170);
    doc.text('Precio Unit.', 130, 170);
    doc.text('Total', 160, 170);
    
    // Productos
    let yPosition = 180;
    let subtotal = 0;
    
    items.forEach((item) => {
      const productName = item.products?.name || item.product?.name || `Producto #${item.id}`;
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      
      doc.setTextColor(...secondaryColor);
      
      // Limitar el nombre del producto a 30 caracteres
      const truncatedName = productName.length > 30 ? 
        productName.substring(0, 30) + '...' : productName;
      
      doc.text(truncatedName, 22, yPosition);
      doc.text(item.quantity.toString(), 115, yPosition);
      doc.text(`$${item.price.toLocaleString('es-CL')}`, 132, yPosition);
      doc.text(`$${itemTotal.toLocaleString('es-CL')}`, 162, yPosition);
      
      yPosition += 8;
      
      // Si llegamos al final de la página, crear nueva página
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 30;
      }
    });
    
    // Línea de separación
    yPosition += 5;
    doc.setLineWidth(0.3);
    doc.setDrawColor(...secondaryColor);
    doc.line(20, yPosition, 190, yPosition);
    
    // Total
    yPosition += 10;
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text('TOTAL:', 130, yPosition);
    doc.setFontSize(14);
    doc.text(`$${order.total.toLocaleString('es-CL')}`, 162, yPosition);
  }
  
  // Pie de página
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setTextColor(...secondaryColor);
  doc.text('Gracias por tu compra. Para consultas, contáctanos a contacto@devhub.cl', 20, pageHeight - 20);
  doc.text(`Factura generada el ${new Date().toLocaleDateString('es-CL')} a las ${new Date().toLocaleTimeString('es-CL')}`, 20, pageHeight - 15);
  
  return doc;
};

export const downloadInvoice = (order: Order, orderItems?: OrderItem[]) => {
  const doc = generateInvoicePDF(order, orderItems);
  const fileName = `factura-${order.id}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

export const previewInvoice = (order: Order, orderItems?: OrderItem[]) => {
  const doc = generateInvoicePDF(order, orderItems);
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
};
