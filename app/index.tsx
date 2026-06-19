import Navigation from "./viewmodel/navigation";
import { AuthProvider } from "./viewmodel/hooks/useAuth";
import { SWRConfig } from "swr";
import { swrFetcher } from "./viewmodel/helper/api";

export default function App() {
    return (
        <AuthProvider>
            <SWRConfig value={{ fetcher: swrFetcher }}>
                <Navigation />
            </SWRConfig>
        </AuthProvider>
    );
}