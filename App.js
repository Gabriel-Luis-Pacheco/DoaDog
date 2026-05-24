import React, { useState } from 'react';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView
} from 'react-native';

const Tab = createBottomTabNavigator();


// HOME

function HomeScreen({ dogs }) {
  return (
    <ScrollView style={styles.container}>

      <Text style={styles.title}>
        🐶 Dogs para adoção
      </Text>

      {dogs.length === 0 ? (
        <Text style={styles.text}>
          Nenhum dog cadastrado ainda.
        </Text>
      ) : (
        dogs.map((dog, index) => (
          <View key={index} style={styles.card}>

            <Text style={styles.name}>
              {dog.name}
            </Text>

            <Text style={styles.text}>
              {dog.desc}
            </Text>

          </View>
        ))
      )}

    </ScrollView>
  );
}


// ADICIONAR

function AddScreen({ addDog }) {

  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  function handleAddDog() {

    if (name === '' || desc === '') {
      return;
    }

    addDog({
      name,
      desc
    });

    setName('');
    setDesc('');
  }

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        ➕ Adicionar cão
      </Text>

      <TextInput
        placeholder="Nome do cão"
        placeholderTextColor="#999"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        placeholder="Descrição"
        placeholderTextColor="#999"
        style={styles.input}
        value={desc}
        onChangeText={setDesc}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleAddDog}
      >
        <Text style={styles.buttonText}>
          Salvar
        </Text>
      </TouchableOpacity>

    </View>
  );
}


// DOAÇÕES

function DonationsScreen() {
  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        💰 Doações
      </Text>

      <Text style={styles.text}>
        A fazer...
      </Text>

    </View>
  );
}


// PERFIL

function ProfileScreen() {
  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        👤 Perfil
      </Text>

      <Text style={styles.text}>
        Gabriel Pacheco
      </Text>

      <Text style={styles.text}>
        Voluntário
      </Text>

    </View>
  );
}


// APP

export default function App() {

  const [dogs, setDogs] = useState([]);

  function addDog(newDog) {
    setDogs([...dogs, newDog]);
  }

  return (
    <NavigationContainer>

      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#111'
          },
          tabBarActiveTintColor: '#ff6b00',
          tabBarInactiveTintColor: '#999'
        }}
      >

        <Tab.Screen
          name="🐶 Home"
        >
          {() => <HomeScreen dogs={dogs} />}
        </Tab.Screen>

        <Tab.Screen
          name="➕ Adicionar"
        >
          {() => <AddScreen addDog={addDog} />}
        </Tab.Screen>

        <Tab.Screen
          name="💰 Doações"
          component={DonationsScreen}
        />

        <Tab.Screen
          name="👤 Perfil"
          component={ProfileScreen}
        />

      </Tab.Navigator>

    </NavigationContainer>
  );
}


// ESTILOS

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#111',
    padding: 20
  },

  title: {
    color: '#fff',
    fontSize: 28,
    marginBottom: 20
  },

  card: {
    backgroundColor: '#222',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15
  },

  name: {
    color: '#fff',
    fontSize: 22
  },

  text: {
    color: '#ccc',
    marginTop: 10
  },

  input: {
    backgroundColor: '#222',
    color: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15
  },

  button: {
    backgroundColor: '#ff6b00',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center'
  },

  buttonText: {
    color: '#fff',
    fontSize: 16
  }

});                      