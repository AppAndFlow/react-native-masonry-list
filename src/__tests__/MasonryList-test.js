// @flow

import * as React from 'react';
import renderer from 'react-test-renderer';

import MasonryList from '../MasonryList';

jest.mock('Blob', () => ({})).mock('URL', () => ({}));

describe('MasonryList', () => {
  it('renders correctly', () => {
    const component = renderer
      .create(
        <MasonryList
          data={[]}
          getHeightForItem={() => 1}
          renderItem={() => {}}
        />,
      )
      .toJSON();
    expect(component).toMatchSnapshot();
  });

  it('should render a single column list', () => {
    const component = renderer
      .create(
        <MasonryList
          data={[{ key: 'i1' }, { key: 'i2' }, { key: 'i3' }]}
          getHeightForItem={() => 1}
          renderItem={({ item }) => <item value={item.key} />}
        />,
      )
      .toJSON();
    expect(component).toMatchSnapshot();
  });

  it('should render a header', () => {
    /**
     *  this test will render only the header without list.
     *  This because when ListHeaderComponent is passed,
     *  the list isn't render until the header is measured
     */
    const component = renderer
      .create(
        <MasonryList
          data={[{ key: 'i1' }, { key: 'i2' }, { key: 'i3' }]}
          getHeightForItem={() => 1}
          ListHeaderComponent={() => <header />}
          renderItem={({ item }) => <item value={item.key} />}
        />,
      )
      .toJSON();
    expect(component).toMatchSnapshot();
  });

  it('should render empty component', () => {
    const component = renderer
      .create(
        <MasonryList
          data={[]}
          getHeightForItem={() => 1}
          ListEmptyComponent={() => <empty />}
          renderItem={({ item }) => <item value={item.key} />}
        />,
      )
      .toJSON();
    expect(component).toMatchSnapshot();
  });
});
