// @flow

import React, { Component, cloneElement } from 'react';
import {
  VirtualizedList,
  View,
  ScrollView,
  StyleSheet,
  findNodeHandle,
  RefreshControl,
} from 'react-native';

type Column = {
  index: number,
  totalHeight: number,
  data: Array<any>,
  heights: Array<number>,
};

const _stateFromProps = ({ numColumns, data, getHeightForItem }) => {
  const columns: Array<Column> = Array.from({
    length: numColumns,
  }).map((col, i) => ({
    index: i,
    totalHeight: 0,
    data: [],
    heights: [],
  }));

  data.forEach((item, index) => {
    const height = getHeightForItem({ item, index });
    const column = columns.reduce(
      (prev, cur) => (cur.totalHeight < prev.totalHeight ? cur : prev),
      columns[0],
    );
    column.data.push(item);
    column.heights.push(height);
    column.totalHeight += height;
  });

  return { columns };
};

export type Props = {
  data: Array<any>,
  numColumns: number,
  renderItem: ({ item: any, index: number, column: number }) => ?ReactElement<
    *,
  >,
  getHeightForItem: ({ item: any, index: number }) => number,
  ListHeaderComponent?: ?ReactClass<any>,
  /**
   * Used to extract a unique key for a given item at the specified index. Key is used for caching
   * and as the react key to track item re-ordering. The default extractor checks `item.key`, then
   * falls back to using the index, like React does.
   */
  keyExtractor?: (item: any, index: number) => string,
  // onEndReached will get called once per column, not ideal but should not cause
  // issues with isLoading checks.
  onEndReached?: ?(info: { distanceFromEnd: number }) => void,
  contentContainerStyle?: any,
  onEndReachedThreshold?: ?number,
  scrollEventThrottle: number,
  renderScrollComponent: (props: Object) => ReactElement<any>,
  /**
   * Set this true while waiting for new data from a refresh.
   */
  refreshing?: ?boolean,
  /**
   * If provided, a standard RefreshControl will be added for "Pull to Refresh" functionality. Make
   * sure to also set the `refreshing` prop correctly.
   */
  onRefresh?: ?Function,
};

// This will get cloned and added a bunch of props that are supposed to be on
// ScrollView so we wan't to make sure we don't pass them over (especially
// onLayout since it exists on both).
class FakeScrollView extends Component {
  props: { style?: any, children?: any };
  render() {
    return <View style={this.props.style}>{this.props.children}</View>;
  }
}

export default class MasonryList extends Component {
  static defaultProps = {
    scrollEventThrottle: 50,
    numColumns: 1,
    renderScrollComponent: (props: Props) => {
      if (props.onRefresh) {
        return (
          <ScrollView
            {...props}
            refreshControl={
              <RefreshControl
                refreshing={props.refreshing}
                onRefresh={props.onRefresh}
              />
            }
          />
        );
      }
      return <ScrollView {...props} />;
    },
  };

  props: Props;
  state = { ..._stateFromProps(this.props), headerHeight: null };
  _listRefs: Array<VirtualizedList> = [];
  _scrollRef: ?ScrollView;
  _endsReached = 0;

  componentWillReceiveProps(newProps: Props) {
    this.setState(_stateFromProps(newProps));
  }

  getScrollResponder() {
    if (this._scrollRef && this._scrollRef.getScrollResponder) {
      return this._scrollRef.getScrollResponder();
    }
    return null;
  }

  getScrollableNode() {
    if (this._scrollRef && this._scrollRef.getScrollableNode) {
      return this._scrollRef.getScrollableNode();
    }
    return findNodeHandle(this._scrollRef);
  }

  scrollToOffset({ offset, animated }: any) {
    if (this._scrollRef) {
      this._scrollRef.scrollTo({ y: offset, animated });
    }
  }

  _onLayout = event => {
    this._listRefs.forEach(list => list._onLayout(event));
  };

  _onContentSizeChange = (width, height) => {
    this._listRefs.forEach(list => list._onContentSizeChange(width, height));
  };

  _onScroll = event => {
    this._listRefs.forEach(list => list._onScroll(event));
  };

  _onScrollBeginDrag = event => {
    this._listRefs.forEach(
      list => list._onScrollBeginDrag && list._onScrollBeginDrag(event),
    );
  };

  _onScrollEndDrag = event => {
    this._listRefs.forEach(
      list => list._onScrollEndDrag && list._onScrollEndDrag(event),
    );
  };

  _onMomentumScrollEnd = event => {
    this._listRefs.forEach(
      list => list._onMomentumScrollEnd && list._onMomentumScrollEnd(event),
    );
  };

  _onHeaderLayout = event => {
    this.setState({ headerHeight: event.nativeEvent.layout.height });
  };

  _getItemLayout = (columnIndex, rowIndex) => {
    const column = this.state.columns[columnIndex];
    let offset = 0;
    for (let ii = 0; ii < rowIndex; ii += 1) {
      offset += column.heights[ii];
    }
    return { length: column.heights[rowIndex], offset, index: rowIndex };
  };

  _renderScrollComponent = () => <FakeScrollView style={styles.column} />;

  _renderPlaceholderHeader = () => (
    <View style={{ height: this.state.headerHeight }} />
  );

  _getItemCount = data => data.length;

  _getItem = (data, index) => data[index];

  _captureScrollRef = ref => (this._scrollRef = ref);

  render() {
    const {
      renderItem,
      ListHeaderComponent,
      keyExtractor,
      onEndReached,
      ...props
    } = this.props;
    let headerElement;
    if (ListHeaderComponent) {
      headerElement = (
        <View onLayout={this._onHeaderLayout} style={styles.header}>
          <ListHeaderComponent />
        </View>
      );
    }

    const content = (
      <View style={styles.contentContainer}>
        {(!headerElement || this.state.headerHeight !== null) &&
          this.state.columns.map(col => (
            <VirtualizedList
              {...props}
              ref={ref => (this._listRefs[col.index] = ref)}
              key={`$col_${col.index}`}
              data={col.data}
              getItemCount={this._getItemCount}
              getItem={this._getItem}
              getItemLayout={(data, index) =>
                this._getItemLayout(col.index, index)}
              renderItem={({ item, index }) =>
                renderItem({ item, index, column: col.index })}
              renderScrollComponent={this._renderScrollComponent}
              keyExtractor={keyExtractor}
              ListHeaderComponent={
                headerElement && this._renderPlaceholderHeader
              }
              onEndReached={onEndReached}
              onEndReachedThreshold={this.props.onEndReachedThreshold}
              removeClippedSubviews={false}
            />
          ))}
      </View>
    );

    const scrollComponent = cloneElement(
      this.props.renderScrollComponent(this.props),
      {
        ref: this._captureScrollRef,
        removeClippedSubviews: false,
        onContentSizeChange: this._onContentSizeChange,
        onLayout: this._onLayout,
        onScroll: this._onScroll,
        onScrollBeginDrag: this._onScrollBeginDrag,
        onScrollEndDrag: this._onScrollEndDrag,
        onMomentumScrollEnd: this._onMomentumScrollEnd,
      },
      content,
      // $FlowFixMe(>=0.47.0)
      headerElement,
    );

    return scrollComponent;
  }
}

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
  },
  column: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
