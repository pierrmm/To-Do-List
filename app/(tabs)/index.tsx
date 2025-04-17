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
    
    <View style={tw`px-5 bg-white dark:bg-gray-900 flex-1`}>
      <SafeAreaView style={tw`py-4`}>
        <ThemedText style={tw`text-3xl text-black font-bold mt-8 mb-4 text-center`} onPress={addTask}>📋 nGopoyo</ThemedText>
        <View style={tw`flex pb-6 flex-row gap-4 justify-center items-center`}>
          <TextInput
            style={tw`bg-gray-100 dark:bg-gray-700 p-4 rounded-xl w-72 text-black dark:text-white shadow-sm`}
            placeholder="What's your task?"
            placeholderTextColor={tw.color('gray-400')}
            value={task}
            onChangeText={setTask}
          />
          <TouchableOpacity 
            style={tw`bg-purple-700 p-3 rounded-xl shadow-lg`} 
            onPress={isEditing ? handleEdit : addTask}
          >
            <AntDesign name={isEditing ? "edit" : "plus"} size={26} color="white" />
          </TouchableOpacity>
        </View>
        <ThemedText style={tw`text-gray-500 font-bold text-lg mb-2`}>To do : {list.length}</ThemedText>
        <FlatList
          data={list}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ThemedView style={tw`py-4 px-5 my-2 bg-white dark:bg-gray-800 rounded-xl shadow-md flex flex-row justify-between items-center`}>
              <View style={tw`flex px-5 flex-row items-center gap-3`}>
                <TouchableOpacity
                  onPress={() => {
                    handleCheckmark(item.id);
                  }}
                  style={tw`p-2`}
                >
                  <View style={tw`w-7 h-7 border-2 border-gray-400 rounded-lg justify-center items-center ${item.done ? 'bg-green-500 border-green-500' : 'bg-white'}`}>
                    {item.done && <AntDesign name="check" size={18} color="white" />}
                  </View>
                </TouchableOpacity>
                <ThemedText style={tw`text-gray-700 dark:text-white text-lg ${item.done ? 'line-through text-gray-400' : ''}`}>{item.text}</ThemedText>
              </View>
              <View style={tw`flex flex-row gap-2`}>
                <TouchableOpacity
                  onPress={() => {
                    startEditing(item);
                  }}
                  style={tw`bg-purple-700 p-2.5 rounded-xl shadow-lg`}
                >
                  <FontAwesome name="pencil" size={22} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    deleteTask(item.id);
                  }}
                  style={tw`bg-red-500 p-2.5 rounded-xl shadow-lg`}
                >
                  <FontAwesome6 name="trash" size={22} color="white" />
                </TouchableOpacity>
              </View>
            </ThemedView>
          )}
        />
      </SafeAreaView>
    </View>  
    );
}