import * as puppeteer from 'puppeteer';
import { generateInvoiceHTML, InvoiceData } from './email';

let browser: puppeteer.Browser | null = null;

// Inicializar el navegador (singleton para mejor performance)
const getBrowser = async (): Promise<puppeteer.Browser> => {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-default-apps',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-field-trial-config',
        '--disable-back-forward-cache',
        '--disable-hang-monitor',
        '--disable-ipc-flooding-protection',
        '--disable-popup-blocking',
        '--disable-prompt-on-repost',
        '--force-color-profile=srgb',
        '--metrics-recording-only',
        '--no-crash-upload',
        '--enable-automation',
        '--use-mock-keychain'
      ],
      ignoreDefaultArgs: ['--disable-extensions'],
      timeout: 60000, // 60 segundos timeout
      protocolTimeout: 60000
    });
  }
  return browser;
};

// Función para generar PDF desde HTML
export const generatePDF = async (html: string): Promise<Buffer> => {
  let page: puppeteer.Page | null = null;

  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    // Configurar timeouts de página
    await page.setDefaultTimeout(30000);
    await page.setDefaultNavigationTimeout(30000);

    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Configurar el PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      },
      displayHeaderFooter: false,
      preferCSSPageSize: false,
    });

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('Error generando PDF:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    throw new Error(`Error al generar PDF: ${errorMessage}`);
  } finally {
    if (page) {
      try {
        await page.close();
      } catch (closeError) {
        console.warn('Error cerrando página:', closeError);
      }
    }
  }
};

// Función para generar PDF de factura
export const generateInvoicePDF = async (invoiceData: InvoiceData): Promise<Buffer> => {
   const html = generateInvoiceHTML(invoiceData);
   return await generatePDF(html);
};

// Función para generar y obtener PDF por ID de pago
export const generateInvoicePDFByPaymentId = async (paymentId: string): Promise<{ success: boolean; pdf?: Buffer; message: string }> => {
   try {
      // Importar modelos necesarios
      const Payments = (await import('../modules/payments/model')).default;
      const Customers = (await import('../modules/customers/model')).default;
      const OrderBuy = (await import('../modules/orderBuyWash/model')).default;
      const Product = (await import('../modules/product/model')).default;

      // Buscar el pago con toda la información relacionada
      const payment = await Payments.findById(paymentId)
         .populate({
            path: 'orderBuyId',
            populate: [
               { path: 'customerId', select: 'name lastname email' },
               { path: 'nameService', select: 'product' },
               { path: 'vehicleId', select: 'marca modelo patente' }
            ]
         });

      if (!payment) {
         return { success: false, message: 'Factura no encontrada' };
      }

      const order = payment.orderBuyId as any;
      if (!order) {
         return { success: false, message: 'Información de la orden no disponible' };
      }

      // Preparar datos para generar la factura
      const invoiceData: InvoiceData = {
         invoiceNumber: payment.invoiceNumber,
         billId: payment.billId,
         customerName: order.customerId?.name || 'Cliente',
         customerLastname: order.customerId?.lastname || 'Desconocido',
         serviceName: order.nameService?.product || 'Servicio de lavado',
         vehicleInfo: order.vehicleId ? {
            marca: order.vehicleId.marca,
            modelo: order.vehicleId.modelo,
            patente: order.vehicleId.patente,
         } : undefined,
         amount: payment.amount,
         paymentMethod: payment.paymentMethod,
         paymentDate: payment.paiDate,
      };

    // Generar PDF
    try {
      const pdfBuffer = await generateInvoicePDF(invoiceData);

      return {
        success: true,
        pdf: pdfBuffer,
        message: 'PDF generado exitosamente'
      };
    } catch (pdfError) {
      console.error('Error generando PDF:', pdfError);

      // Si es un error de Puppeteer, intentar reiniciar el navegador
      const errorMessage = pdfError instanceof Error ? pdfError.message : String(pdfError);
      if (errorMessage.includes('ProtocolError') || errorMessage.includes('WebSocket')) {
        try {
          await restartBrowser();
          console.log('Navegador reiniciado debido a error de protocolo');
        } catch (restartError) {
          console.error('Error reiniciando navegador:', restartError);
        }
      }

      return {
        success: false,
        message: 'Error al generar el PDF. Puede deberse a problemas con el navegador. Intente nuevamente.'
      };
    }

  } catch (error) {
    console.error('Error obteniendo datos de factura:', error);
    return { success: false, message: 'Error interno del servidor' };
  }
};

// Función para cerrar el navegador (útil para limpieza)
export const closeBrowser = async (): Promise<void> => {
  if (browser) {
    try {
      await browser.close();
    } catch (error) {
      console.warn('Error cerrando navegador:', error);
    } finally {
      browser = null;
    }
  }
};

// Función para reiniciar el navegador (útil si hay errores)
export const restartBrowser = async (): Promise<void> => {
  await closeBrowser();
  // El próximo llamado a getBrowser() creará uno nuevo
};
