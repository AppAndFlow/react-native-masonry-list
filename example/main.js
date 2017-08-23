// @noflow

import Expo from 'expo';
import React, { Component, PureComponent } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MasonryList from '@appandflow/masonry-list';

const COLORS = ['green', 'blue', 'red'];
const DATA = Array.from({ length: 50000 }).map((_, i) => ({
  id: `item_${i}`,
  height: Math.round(Math.random() * 100 + 50),
  color: COLORS[i % COLORS.length],
}));

class Cell extends PureComponent {
  componentDidMount() {
    console.warn('mount cell');
  }

  componentWillUnmount() {
    console.warn('unmount cell');
  }

  render() {
    const { item } = this.props;
    return (
      <View
        style={[
          styles.cell,
          { height: item.height, backgroundColor: item.color },
        ]}
      >
        <Text>{item.id}</Text>
      </View>
    );
  }
}

class App extends Component {
  state = { isRefreshing: false };

  _refreshRequest = () => {
    this.setState({ isRefreshing: true });
    setTimeout(() => {
      this.setState({ isRefreshing: false });
    }, 1000);
  };

  render() {
    return (
      <MasonryList
        onRefresh={this._refreshRequest}
        refreshing={this.state.isRefreshing}
        data={DATA}
        renderItem={({ item }) => <Cell item={item} />}
        getHeightForItem={({ item }) => item.height + 2}
        numColumns={2}
        keyExtractor={item => item.id}
      />
    );
  }
}

const styles = StyleSheet.create({
  cell: {
    margin: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

Expo.registerRootComponent(App);
