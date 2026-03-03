import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { useAuth } from '@clerk/clerk-expo'

export default function SignedIn({ navigation }) {
  const { signOut } = useAuth()

  const handleLogout = async () => {
    await signOut()
    navigation.replace('home')
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Text style={{ fontSize: 24 }}>You are signed in</Text>

      <Pressable
        onPress={handleLogout}
        style={{ marginTop: 20, padding: 12, borderWidth: 1 }}
      >
        <Text>Sign Out</Text>
      </Pressable>
    </View>
  )
}