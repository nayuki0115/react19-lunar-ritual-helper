import AppShell  from "@/components/AppShell";
import { AppRouter } from "@/router/index";

const App = () => {
  return (
    <AppShell>
      <AppRouter />
    </AppShell>
  );
};

export default App;