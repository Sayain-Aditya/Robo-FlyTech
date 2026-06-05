import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { ToastProvider } from '@/components/Toast';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import './globals.css';

export const metadata = {
  title: 'Robo Flytech',
  description: 'Robo Flytech sells drones, drone parts, Voci Toci gadgets, and advanced drone accessories.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              {children}
              <WhatsAppFloat />
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
