import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Layout from "../layout";

const Stack = createNativeStackNavigator();

export default function Navigation() {
    return (
        <Stack.Navigator>
                <Stack.Screen
                  name="Layout"
                  component={Layout}
                  options={{ headerShown: false, statusBarStyle: "dark", headerTransparent: true }}
                />
        </Stack.Navigator>
    )
}