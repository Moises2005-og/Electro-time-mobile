import Home from "@/app/view/screens/home";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const Tabs = createBottomTabNavigator();
export default function Layout() {
    return (
        <Tabs.Navigator>
            <Tabs.Screen name="Home" component={Home} options={{
                headerShown: false,
                title: "Inicio",
                tabBarIcon: ({color, focused, size}) => (
                    <Ionicons name="home" color={focused ? color : color} size={size}/>
                    ),
                }} />
        </Tabs.Navigator>
    );
}