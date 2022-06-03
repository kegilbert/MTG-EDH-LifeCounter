 /**
  * MTG EDH Life Tracker
  * 
  * kegilbert
  * Based on: https://github.com/facebook/react-native
  */

import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Dimensions, Button, TouchableHighlight, Alert } from 'react-native';
import { SwipeablePanel } from 'rn-swipeable-panel';
import RNPickerSelect from 'react-native-picker-select';


export default function App() {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center'
    },
    title: {
      fontSize: 32,
    },
    life: {
      fonSize:64,
      textAlign: 'center'
    }
  });

  /**
   * App level constants
   */
  const colorList = [
    '#84DCC6',
    '#FE938C',  
    '#EAC435',
    '#157145',
    '#4B4E6D',
    '#FFA9E7 ',
    '#BA274A'
  ];
  const screenWidth  = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;


  /**
   *  App level internal state
   */
  const [numPlayers, setNumPlayers] = useState(5);
  const [tileHeight, setTileHeight] = useState(screenHeight / (numPlayers));
  const [tileWidth, setTileWidth]   = useState(screenWidth / 2);
  const [lifeGrid, setLifeGrid]     = useState(new Array(numPlayers).fill().map(function(_, idx) { return {life: 40, cmdDmg: new Array(numPlayers).fill(0), cmdDmgDealt: new Array(numPlayers).fill(0), id: idx, playerName: String.fromCharCode(parseInt(idx + 0x41, 0)), color: colorList[idx], highlight: false}; }));
  const [cmdDmgMode, setCmdDmgMode] = useState(false);
  const [cmdDmgSelectionMode, setCmdDmgSelectionMode] = useState(false);
  const [cmdDmgAttacker, setCmdDmgAttacker] = useState(null);
  const [cmdDmgDefender, setCmdDmgDefender] = useState(null);

  /**
   *  Setting's panel config
   */
  const [panelProps, setPanelProps] = useState({
    fullWidth: true,
    openLarge: true,
    showCloseButton: true,
    onClose: () =>  {setIsPanelActive(false); setNumPlayersSelectOpen(false); },
    onPressCloseButton: () => setIsPanelActive(false),
  });
  const [isPanelActive, setIsPanelActive] = useState(false);

  /**
   *  Setting's panel internal states
   */
  const [numPlayersSelect, setNumPlayersSelect] = useState({label: numPlayers, value: numPlayers});
  const [numPlayersSelectOpen, setNumPlayersSelectOpen] = useState(false);
  // const [numPlayersSelectItems, setNumPlayersSelectItems] = useState(new Array(colorList.length).fill().map(function(_, idx) {
  //   return {label: idx, value: idx};
  // }));
  const [numPlayersSelectItems, setNumPlayersSelectItems] = useState([
    {label: '2', value: 2},
    {label: '3', value: 3},
    {label: '4', value: 4},
    {label: '5', value: 5},
    {label: '6', value: 6},
    //{label: '7', value: 7},
  ]);


  useEffect(() => {
    console.log(`Updated Player Count: ${numPlayers}`);
    console.log('\tSetting Height...');
    setTileHeight(Math.round(screenHeight / (numPlayers / (numPlayers % 2 === 0 ? 1.5 : 1.25))));
    setLifeGrid(new Array(numPlayers).fill().map(function(_, idx) { return {life: 40, cmdDmg: new Array(numPlayers).fill(0), cmdDmgDealt: new Array(numPlayers).fill(0), id: idx, playerName: String.fromCharCode(parseInt(idx + 0x41, 0)), color: colorList[idx], highlight: false}; }));
  }, [numPlayers]);


  const resetGame = () => {
    console.log('RESET');
    setLifeGrid(new Array(numPlayers).fill().map(function(_, idx) { return {life: 40, cmdDmg: new Array(numPlayers).fill(0), cmdDmgDealt: new Array(numPlayers).fill(0), id: idx, playerName: String.fromCharCode(parseInt(idx + 0x41, 0)), color: colorList[idx], highlight: false}; }));
  }


  const generateColor = () => {
    const randomColor = Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0');
    return `#${randomColor}`;
  };


  const generateCmdrDmgTable = (item, oddLast) => {
    var cmdDmgHeader = [];
    var cmdDmgTable = [];

    for (var player = 0; player < numPlayers; player++) {
      cmdDmgHeader.push(` ${String.fromCharCode(parseInt(player + 0x41, 0))} `);
      if (item.index === player){
        cmdDmgTable.push(' m ');
      } else {
        cmdDmgTable.push(`${item.item.cmdDmgDealt[player].toString().padStart(2, ' ').padEnd(3, ' ')}`);
      }
    }

    return(
      <>
        <Text style={{
          transform: [{ 
            rotate: oddLast ? '0deg' : 
              item.index % 2 === 0 ? '90deg' : '-90deg'
            }], 
          textAlign: 'center',
          fontSize: 11,
          textAlignVertical: 'bottom',
          flex: 1
        }}>
          {cmdDmgHeader}{'\n'}
        </Text>
        <Text style={{
          transform: [{ 
            rotate: oddLast ? '0deg' : 
              item.index % 2 === 0 ? '90deg' : '-90deg'
            }], 
          textAlign: 'center',
          fontSize: 11,
          textAlignVertical: 'bottom',
          flex: 1
        }}>
          {cmdDmgTable}
        </Text>
        </>
      );
  };


  const Item = ({ item, oddLast }) => (
    <TouchableHighlight 
      key={item.index}
      onLongPress={() => { 
        if (cmdDmgMode) {
          setCmdDmgMode(false);
          setCmdDmgSelectionMode(false);
          var modifiedLifeGrid = [...lifeGrid];
          modifiedLifeGrid = modifiedLifeGrid.map((player) => {
              return {...player, highlight: false, selected: false} 
          });
          setCmdDmgAttacker(null);
          setCmdDmgDefender(null);
          setLifeGrid(modifiedLifeGrid);
        } else {
          setCmdDmgMode(true);
          setCmdDmgSelectionMode(true);
          setCmdDmgAttacker(item.index);
          var modifiedLifeGrid = [...lifeGrid];
          modifiedLifeGrid = modifiedLifeGrid.map((player) => { return {...player, highlight: player.id !== item.index} });
          setLifeGrid(modifiedLifeGrid);
        }
      }}
    >
    <View onTouchEnd={(e) => {
        var modifiedLifeGrid = [...lifeGrid];
        var cmdDmgDealt = cmdDmgAttacker === null ? null : modifiedLifeGrid[cmdDmgAttacker].cmdDmgDealt;
        var newCmdDmg = 0;

        if (cmdDmgSelectionMode) {
          modifiedLifeGrid = modifiedLifeGrid.map((player) => { return {...player, selected: player.id === item.index, highlight: false} });
          setCmdDmgSelectionMode(false);
          setCmdDmgDefender(item.index);
        } else {
          var lifeDiff = (e.nativeEvent.locationY <= tileWidth / 2) ? 1 : -1;

          modifiedLifeGrid = modifiedLifeGrid.map((player) => {
            if (player.id === item.index) {
              const newLife = player.life + (cmdDmgMode ? -1*lifeDiff : lifeDiff);
              newCmdDmg = cmdDmgMode && cmdDmgAttacker !== null ? cmdDmgDealt[cmdDmgDefender] + lifeDiff : 0;

              return {...player, life: newLife};
            }
              return player;
          });
          if (cmdDmgMode) {
            modifiedLifeGrid[cmdDmgAttacker] = {...modifiedLifeGrid[cmdDmgAttacker], cmdDmgDealt: cmdDmgDealt.map((cmd_dmg, id) => {
              if (id === cmdDmgDefender && newCmdDmg > 0) {
                return newCmdDmg;
              }
              return cmd_dmg;
            })};
          }
        }

        setLifeGrid(modifiedLifeGrid);
      }}
      style={{backgroundColor: `${item.item.color}`, borderWidth: 5, borderColor: item.item.highlight ? '#39FF14' : item.item.selected ? 'red' : 'inherit', height: tileHeight, width: oddLast ? screenWidth : tileWidth}}
    >
      <Text style={{    
        transform: [{ 
          rotate: oddLast ? '0deg' : 
            item.index % 2 === 0 ? '90deg' : '-90deg'
          }], 
        textAlign: 'center',
        fontSize: 52,
        textAlignVertical: 'center',
        flex: 1,
      }}>
      <Text style={{
        transform: [{ 
          rotate: oddLast ? '0deg' : 
            item.index % 2 === 0 ? '90deg' : '-90deg'
          }], 
        textAlign: 'center',
        fontSize: 32,
        textAlignVertical: 'center',
        flex: 1,
      }}>
        {item.item.playerName}{'\n'}
      </Text>
        {cmdDmgMode && cmdDmgAttacker !== null ? `${lifeGrid[cmdDmgAttacker].cmdDmgDealt[item.index]}` : `${item.item.life}`}{'\n'}
        {generateCmdrDmgTable(item, oddLast)}
      </Text>
{/*      <Button
        onPress={(e) => { console.log(e); }}
        title='Button'
      />*/}
    </View>
    </TouchableHighlight>
  );


  const renderGridCell = (item) => {
    return <Item item={item} oddLast={(item.index === (numPlayers - 1) && numPlayers % 2 !== 0)}/>;
  }


  const promptForReset = (value) =>
    Alert.alert(
      "Warning - Detected Game in Progress",
      "Changing number of players will reset the game",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        {
          text: "Proceed",
          onPress: () => setNumPlayers(value),
          style: "ok",
        },
      ]
    );


  return (
    <>
    <View style={styles.container}>
      <Text style={{fontSize: 32, textAlign: 'center'}}>MTG Life Counter</Text>
    </View>
    <FlatList data={lifeGrid} renderItem={renderGridCell} numColumns={2}/>
    <View style={[styles.container, {marginTop: '-10%'}]}>
      {
        isPanelActive ? 
          <></> :
          <Button
            onPress={(e) => { setIsPanelActive(!isPanelActive); }}
            title='Settings'
          />
      }
    </View>
      <SwipeablePanel {...panelProps} isActive={isPanelActive} closeOnTouchOutside={true}>
        <RNPickerSelect
          value={numPlayersSelect}
          items={numPlayersSelectItems}
          placeholder={{label: 'Number of Players', value: null}}
          onValueChange={(value) => { 
            if (value !== null) {
              if (!lifeGrid.map(player => {return player.life}).every((life) => life === 40))  { 
                promptForReset(value);
              } else {
                setNumPlayers(value);
              }
            }
          }}

        />
        <View style={{flex: 1, justifyContent: 'center', }}>
          <Button
            title='Reset'
            onPress={() => resetGame()}
          />
        </View>
      </SwipeablePanel>
    </>
  );
}

