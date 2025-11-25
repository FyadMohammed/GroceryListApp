import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
    //code goes here
    
    //Get navigation router and auth context
    const router = useRouter();
    const { logout }  = useAuth();

    
    //State for the list of items
    const [groceryItems, setGroceryItems] = useState([
        //Grocery has items with id, name and purchased status
        { id : '1' , name: 'Milk',  purchased: false},
        { id : '2' , name: 'Eggs',  purchased: false},
        { id : '3' , name: 'Bread', purchased: false},
        { id : '4' , name: 'Cheese', purchased: false},
    ]);

    //State for the new item input field
    const [newItem, setNewItem] = useState('');

    //Function to add a new item to the list
    const handleAddItem = () => {
        //Validation: Check if the input is empty
        if(newItem.trim() === ''){
            Alert.alert('Please enter an item name,');
            return;
        }

        //Create a new item object and add it to the list
        const newItemObj = {
            id: Date.now().toString(), //Unique id based on timestamp
            name: newItem,
            purchased: false,
        };

        //Add new item to the list and reset the input field
        setGroceryItems([...groceryItems, newItemObj]);
        
        //Clear the input field
        setNewItem('');
    };

    // Function to mark an item as purchased or unpurchased
    const handleTogglePurchased = (id: string) =>  {
        //Update the item with matching id
        const updatedItems = groceryItems.map((item) => {
            if (item.id === id) {
                //Toggle the purchased status
                return { ...item, purchased: !item.purchased };
            }
            return item;
        });

        //Update the state with the modified items array
        setGroceryItems(updatedItems);
    };

    //Function to delete an item from the list
    const handleDeleteItem = (id: string) => {
        //Filter out the item with the matching id
        const filteredItems = groceryItems.filter((item) => item.id !== id);

        //Set Grocery Items
        setGroceryItems(filteredItems);
    };

    //Logout handler function
    const handleLogout =() => {
        //Call logout function from AuthContext
        logout();

        //Navigation happens automatically when logged out
        //But we can also explicitly navigate if needed
        //router.replace('/path/to/LoginScreen'); pushses to login screen
        router.replace('../login');

        //push() - add a new screen to stack. User can go back
        //replace() - replace current screen. User cannot go back
    };

    //Render each item in the FlatList
    const renderItem = ({ item }: { item: { id: string; name: string; purchased: boolean } }) => {
        return (
            <View style={styles.itemContainer}>
                <Pressable
                style={styles.itemContainer}
                onPress={() => handleTogglePurchased(item.id)}>
                    <Text style={styles.checkboxText}>
                        {item.purchased ? '✓' : ''}
                    </Text>
                </Pressable>

                <Text
                style={[
                    styles.itemName,
                    item.purchased ? styles.itemNamePurchased : null,
                ]}
                >
                {item.name}
                </Text>
                <Pressable
                style= {styles.deleteButton}
                onPress={()=> handleDeleteItem(item.id)}
                >
                <Text style= {styles.deleteButtonText}> Delete </Text>
                </Pressable>
            </View>
        );
    };

    return(
        <View style={styles.container}>
            { /* Header */}
            <View>
                <Text style={styles.headerTitle}> My Grocery</Text>
                <Text style={styles.headerSubtitle}> {groceryItems.filter((item) => !item.purchased).length } </Text>
            </View>

            <Pressable style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Logout</Text>

            </Pressable>

            { /* Input Section */ }
            <View>
                <TextInput
                style={styles.input}
                placeholder="Add new item"
                value={newItem}
                onChangeText={setNewItem}
                onSubmitEditing={handleAddItem}
                />
                <Pressable style={styles.addButton} onPress={handleAddItem}>
                    <Text style={styles.addButton}> Add </Text>
                </Pressable>
            </View>

            <FlatList
                data={groceryItems}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                style={styles.listContainer}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    
    //Container style
    container:{
        flex:1,
        backgroundColor: '#f5f5f5',
    },

    //Header styles
    header : {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#007AFF',
        paddingVertical: 20,
        paddingHorizontal: 15,
        
    },
    logoutButton: {
        backgroundColor: '#FF3B30',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 8,
    },
    logoutButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#fff',
    },

    //Input section styles
    inputSection: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    input: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        marginRight: 10,
    },
    addButton: {
        backgroundColor: '#34C759',
        paddingHorizontal: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },

    //List container styles
    listContainer:{
        flex: 1,
        padding: 10,
    },

    //Item styles
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 12,
        paddingHorizontal: 15,
        marginBottom: 8,
        borderRadius: 8,
        borderColor: '#e0e0e0',
        borderWidth: 1,
    },
    checkbox: {
        width: 30,
        height: 30,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    checkboxText: {
        fontSize: 18,
        color: '#007aff',
        fontWeight: 'bold',
    },
    itemName: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },

    itemNamePurchased: {
        textDecorationLine: 'line-through',
        color: '#999',
    },
    deleteButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: '#ff3b30',
        borderRadius: 6,
    },
    deleteButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },

});