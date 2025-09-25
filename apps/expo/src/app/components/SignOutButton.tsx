import { Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useClerk } from "@clerk/clerk-expo";
import { LogOut } from "lucide-react-native";

const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect to your desired page
      router.replace("/");
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <TouchableOpacity
      onPress={handleSignOut}
      className="flex-row items-center rounded-lg bg-white/20 px-4 py-2"
    >
      <LogOut size={16} color="white" className="mr-2" />
      <Text className="font-medium text-white">Sign Out</Text>
    </TouchableOpacity>
  );
};

export default SignOutButton;
