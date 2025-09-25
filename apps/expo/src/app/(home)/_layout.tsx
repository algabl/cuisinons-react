import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { Hamburger, House } from "lucide-react-native";

export default function Layout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon sf="house.fill" drawable="arrow_up_float" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="recipes">
        <Label>Recipes</Label>
        <Icon sf="fork.knife" drawable="gallery_thumb" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search" role="search">
        <Label>Search</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
