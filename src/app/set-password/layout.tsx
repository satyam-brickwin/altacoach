// This layout explicitly avoids inheriting the root layout with navbar
export const metadata = {
  title: 'Set Password',
  description: 'Set your password securely'
};

// Make this a complete page layout that doesn't inherit the root layout with navbar
export default function SetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {/* No navbar included here */}
          {children}
        </div>
      </body>
    </html>
  );
}