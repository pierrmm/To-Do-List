import { Image, StyleSheet, Platform, View, TextInput, TouchableOpacity, SafeAreaView, Text, FlatList } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import tw from 'twrnc';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign, FontAwesome, FontAwesome6 } from '@expo/vector-icons';

interface Task {
  id: string;
  text: string;
}

export default function HomeScreen() {
  const [task, setTask] = useState('');
  const [list, setlist] = useState<Task[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');

  useEffect(() => {
    loadTask();
  }, []);

  useEffect(() => {
    saveTask();
  }, [list]);

  const loadTask = async () => {
    try {
      const saved = await AsyncStorage.getItem('tasks');
      if (saved !== null) {
        setlist(JSON.parse(saved));
      }
      console.log('Data berhasil diambil');
    } catch (error) {
      console.log('gagal mengambil data', error);
    }
  }

  const saveTask = async () => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(list));
      console.log('Data berhasil disimpan');
    } catch (error) {
      console.log('gagal menyimpan data', error);
    }
  }

  const addTask = () => {
    if (task.trim() === "") return;

    const newTask = {
      id: Date.now().toString(),
      text: task.trim(),
    };

    setlist([...list, newTask]);
    setTask('');
  }

  const deleteTask = (id: string) => {
    const filtered = list.filter((item) => item.id !== id);
    setlist(filtered);
  };

  const handleEdit = (id: string) => {
    const updated = list.map((item) =>
      item.id === editId ? { ...item, text: task } : item
    );
    setlist(updated);
    setTask('');
    setIsEditing(false);
    setEditId('');
  };

  const startEditing = (item: any) => {
    setTask(item.text);
    setIsEditing(true);
    setEditId(item.id);
  }

  const handleCheckmark = (id: string) => {
    const updated = list.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item
    );
    setlist(updated);
  };


  return (
    <View style={tw`bg-white dark:bg-gray-900 flex-1`}>
      <SafeAreaView style={tw`px-4 py-2`}>
        <ThemedText style={tw`text-2xl text-black font-bold mt-8 mb-2`} onPress={addTask}>📋 nGopoyo</ThemedText>
        <View style={tw`flex pb-5 flex-row justify-center items-center`}>
          <TextInput
            style={tw`mr-4 bg-gray-200 dark:bg-gray-700 p-3 rounded-lg w-64 text-black dark:text-white`}
            placeholder="Enter text here"
            placeholderTextColor={tw.color('gray-500')}
            value={task}
            onChangeText={setTask}
          />
          <TouchableOpacity style={tw`mr-4 bg-purple-800 p-2 px-4 rounded-lg`} onPress={isEditing ? handleEdit : addTask}>
            <AntDesign name="plus" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <ThemedText style={tw`text-gray-500 font-bold`}>TO DO : {list.length}</ThemedText>
        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ThemedView style={tw`py-3 px-4 my-2 shadow-xl bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md flex flex-row justify-between items-center`}>
              <View style={tw`flex flex-row items-center gap-1`}>
                <TouchableOpacity
                  onPress={() => {
                    handleCheckmark(item.id);
                  }}
                  style={tw`p-2 rounded-lg`}
                >
                  <View style={tw`w-6 h-6 border-2 border-gray-400 rounded-md justify-center items-center ${item.done ? 'bg-green-500 border-green-500' : 'bg-white'}`}>
                    {item.done && <AntDesign name="check" size={16} color="white" />}
                  </View>
                </TouchableOpacity>
                <ThemedText style={tw`text-gray-600 dark:text-white text-start`}>{item.text}</ThemedText>
              </View>
              <View style={tw`flex flex-row justify-center items-center text-start`}>
                <View style={tw` flex flex-row gap-1`}>
                  <TouchableOpacity
                    onPress={() => {
                      startEditing(item);
                    }}
                    style={tw`bg-purple-800 p-2 rounded-lg`}
                  >
                    <FontAwesome name="pencil" size={24} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      deleteTask(item.id);
                    }}
                    style={tw`bg-red-500 p-2 rounded-lg`}
                  >
                    <FontAwesome6 name="trash" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </View>
            </ThemedView>
          )}
        />
      </SafeAreaView>
    </View>
  );
}