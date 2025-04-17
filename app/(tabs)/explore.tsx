import { Image, StyleSheet, Platform, View, TextInput, TouchableOpacity, SafeAreaView, Text, FlatList, Alert, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

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
  mapel: string;
  deadline: Date;
  done: boolean;
}

export default function TugasKu() {
  const [task, setTugas] = useState('');
  const [mapel, setMapel] = useState('');
  const [deadline, setDeadline] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [list, setlist] = useState<Task[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState('');
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState('');

  useEffect(() => {
    loadTugas();
  }, []);

  useEffect(() => {
    saveTugas();
  }, [list]);

  const loadTugas = async () => {
    try {
      const saved = await AsyncStorage.getItem('tugas');
      if (saved !== null) {
        const parsedData = JSON.parse(saved);
        parsedData.forEach((task: Task) => {
          task.deadline = new Date(task.deadline);
        });
        setlist(parsedData);
      }
      console.log('Data berhasil diambil');
    } catch (error) {
      console.log('gagal mengambil data', error);
    }
  }

  const saveTugas = async () => {
    try {
      await AsyncStorage.setItem('tugas', JSON.stringify(list));
      console.log('Data berhasil disimpan');
    } catch (error) {
      console.log('gagal menyimpan data', error);
    }
  }

  const addTugas = () => {
    if (task.trim() === "" || mapel.trim() === "") return;

    const newTask = {
      id: Date.now().toString(),
      text: task.trim(),
      mapel: mapel.trim(),
      deadline: deadline,
      done: false
    };

    setlist([...list, newTask]);
    setTugas('');
    setMapel('');
    setDeadline(new Date());
  }

  const deleteTugas = (id: string) => {
    const filtered = list.filter((item) => item.id !== id);
    setlist(filtered);
    setShowDeleteAlert(false);
  };

  const handleEdit = () => {
    const updated = list.map((item) =>
      item.id === editId ? { ...item, text: task, mapel: mapel, deadline: deadline } : item
    );
    setlist(updated);
    setTugas('');
    setMapel('');
    setDeadline(new Date());
    setIsEditing(false);
    setEditId('');
  };

  const startEditing = (item: Task) => {
    setTugas(item.text);
    setMapel(item.mapel);
    setDeadline(item.deadline);
    setIsEditing(true);
    setEditId(item.id);
  }

  const handleCheckmark = (id: string) => {
    const updated = list.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item
    );
    setlist(updated);
  };

  const onDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDeadline(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const confirmDelete = (id: string) => {
    setTaskToDelete(id);
    setShowDeleteAlert(true);
  };

  return (
    <View style={tw`px-5 bg-white dark:bg-gray-900 flex-1`}>
      <SafeAreaView style={tw`py-2`}>
        <ThemedText style={tw`text-2xl font-bold text-black mt-8 mb-5`}>📋 Tugasku</ThemedText>

        <TextInput
          style={tw`bg-gray-200 dark:bg-gray-700 p-4 rounded-lg mb-3 text-black dark:text-white`}
          placeholder="Add tugas Apa hari ini?"
          placeholderTextColor={tw.color('gray-500')}
          value={task}
          onChangeText={setTugas}
        />

        <TextInput
          style={tw`bg-gray-200 dark:bg-gray-700 p-4 rounded-lg mb-3 text-black dark:text-white`}
          placeholder="Mapelnya apa tu?"
          placeholderTextColor={tw.color('gray-500')}
          value={mapel}
          onChangeText={setMapel}
        />

        <View style={tw`flex-row mb-3`}>
          <TouchableOpacity
            style={tw`bg-gray-200 dark:bg-gray-700 p-4 text-black rounded-lg flex-1 mr-1`}
            onPress={() => setShowDatePicker(true)}
          >
            <ThemedText style={tw`text-black dark:text-white`}>
              {formatDate(deadline)}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`bg-purple-800 p-4 rounded-lg text-black justify-center items-center`}
            onPress={() => setShowDatePicker(true)}
          >
            <FontAwesome name="calendar" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={deadline}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        <TouchableOpacity
          style={tw`${isEditing ? 'bg-blue-500' : 'bg-purple-800'} p-4 rounded-lg mb-5 justify-center items-center`}          onPress={isEditing ? handleEdit : addTugas}
        >
          <ThemedText style={tw`text-white text-center font-bold`}>{isEditing ? 'Simpan tugas' : 'Tambah tugas'}</ThemedText>
        </TouchableOpacity>

        {list.length > 0 && (
          <ThemedText style={tw`text-gray-500 font-bold mb-2`}>ADA {list.length} TUGAS NI KAMU!</ThemedText>
        )}

        {list.length === 0 ? (
          <ThemedText style={tw`text-gray-500 font-bold text-center`}>YEAY GADA TUGAS KAMU</ThemedText>
        ) : (
          <FlatList
            data={list}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ThemedView style={tw`py-4 px-5 my-2 bg-white dark:bg-gray-800 rounded-xl shadow-md flex flex-row justify-between items-center`}>
                <View style={tw`flex px-5 flex-row items-center gap-3`}>
                  <TouchableOpacity
                    onPress={() => handleCheckmark(item.id)}
                    style={tw`p-2`}
                  >
                    <View style={tw`w-7 h-7 border-2 border-gray-400 rounded-lg justify-center items-center ${item.done ? 'bg-green-500 border-green-500' : 'bg-white'}`}>
                      {item.done && <AntDesign name="check" size={18} color="white" />}
                    </View>
                  </TouchableOpacity>
                  <View>
                    <ThemedText style={tw`text-gray-700 dark:text-white text-lg ${item.done ? 'line-through text-gray-400' : ''}`}>{item.text}</ThemedText>
                    <ThemedText style={tw`text-gray-400 dark:text-gray-400 text-sm ${item.done ? 'line-through text-gray-400' : ''}`}>{item.mapel}</ThemedText>
                    <ThemedText style={tw`text-red-500 font-bold dark:text-gray-400 text-sm ${item.done ? 'line-through text-gray-400' : ''}`}>
                      {new Date(item.deadline).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </ThemedText>
                  </View>
                </View>
                <View style={tw`flex flex-row gap-2`}>
                  <TouchableOpacity
                    onPress={() => startEditing(item)}
                    style={tw`bg-purple-700 p-2.5 rounded-xl shadow-lg`}
                  >
                    <FontAwesome name="pencil" size={22} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => confirmDelete(item.id)}
                    style={tw`bg-red-500 p-2.5 rounded-xl shadow-lg`}
                  >
                    <FontAwesome6 name="trash" size={22} color="white" />
                  </TouchableOpacity>
                </View>
              </ThemedView>
            )}
          />        )}
      </SafeAreaView>


      <Modal
        transparent={true}
        visible={showDeleteAlert}
        animationType="fade"
        onRequestClose={() => setShowDeleteAlert(false)}
      >
        <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
          <View style={tw`bg-white dark:bg-gray-800 rounded-xl p-5 w-80 shadow-xl`}>
            <View style={tw`items-center mb-4`}>
              <View style={tw`bg-red-100 p-4 rounded-full mb-2`}>
                <FontAwesome6 name="trash" size={30} color={tw.color('red-500')} />
              </View>
              <ThemedText style={tw`text-xl font-bold text-black dark:text-white text-center`}>Konfirmasi Hapus</ThemedText>
            </View>
            
            <ThemedText style={tw`text-gray-600 dark:text-gray-300 text-center mb-5`}>
              Apakah kamu yakin ingin menghapus tugas ini?
            </ThemedText>
            
            <View style={tw`flex-row justify-between`}>
              <TouchableOpacity 
                style={tw`bg-gray-200 dark:bg-gray-700 py-3 px-5 rounded-lg flex-1 mr-2`}
                onPress={() => setShowDeleteAlert(false)}
              >
                <ThemedText style={tw`text-center text-black dark:text-white font-bold`}>Batal</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={tw`bg-red-500 py-3 px-5 rounded-lg flex-1`}
                onPress={() => deleteTugas(taskToDelete)}
              >
                <Text style={tw`text-white text-center font-bold`}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}