import React from 'react';
import { shallow } from 'enzyme';

import withSelectFetch from '../withSelectFetch';

const TestComponent = () => <div />;

const SelectFetch = withSelectFetch(TestComponent);

const defaultProps = {
  url: 'test-url',
};

const setup = (props) => {
  const wrapper = shallow(
    <SelectFetch
      {...defaultProps}
      {...props}
    />,
  );

  const getSelectNode = () => wrapper.find(TestComponent);

  const loadOptions = (...args) => getSelectNode().prop('loadOptions')(...args);

  return {
    getSelectNode,
    loadOptions,
  };
};

test('should render AsyncPaginate with correct props', () => {
  const page = setup({
    url: 'test-url',
    queryParams: {},
    searchParamName: 'search',
    pageParamName: 'page',
    offsetParamName: 'offset',
    mapResponse: jest.fn(),
    get: jest.fn(),
    restProp: 'restPropValue',
  });

  const selectNode = page.getSelectNode();

  expect(selectNode.prop('url')).toBeFalsy();
  expect(selectNode.prop('queryParams')).toBeFalsy();
  expect(selectNode.prop('searchParamName')).toBeFalsy();
  expect(selectNode.prop('pageParamName')).toBeFalsy();
  expect(selectNode.prop('offsetParamName')).toBeFalsy();
  expect(selectNode.prop('mapResponse')).toBeFalsy();
  expect(selectNode.prop('get')).toBeFalsy();
  expect(selectNode.prop('restProp')).toBe('restPropValue');
});

test('should call get with default arguments', async () => {
  const get = jest.fn();

  const page = setup({
    url: 'test-url',
    queryParams: {
      param1: 'value1',
      param2: 'value2',
    },
    get,
  });

  await page.loadOptions('testSearch', [1, 2, 3], { page: 10 });

  expect(get.mock.calls.length).toBe(1);
  expect(get.mock.calls[0][0]).toBe('test-url');
  expect(get.mock.calls[0][1]).toEqual({
    param1: 'value1',
    param2: 'value2',
    search: 'testSearch',
    page: 10,
    offset: 3,
  });
});

test('should redefine search param name in query params', async () => {
  const get = jest.fn();

  const page = setup({
    url: 'test-url',
    queryParams: {
      param1: 'value1',
      param2: 'value2',
    },
    searchParamName: 'search',
    get,
  });

  await page.loadOptions('testSearch', [1, 2, 3], { page: 10 });

  expect(get.mock.calls.length).toBe(1);
  expect(get.mock.calls[0][0]).toBe('test-url');
  expect(get.mock.calls[0][1]).toEqual({
    param1: 'value1',
    param2: 'value2',
    search: 'testSearch',
    page: 10,
    offset: 3,
  });
});

test('should redefine page param name in query params', async () => {
  const get = jest.fn();

  const page = setup({
    url: 'test-url',
    queryParams: {
      param1: 'value1',
      param2: 'value2',
    },
    pageParamName: 'currentPage',
    get,
  });

  await page.loadOptions('testSearch', [1, 2, 3], { page: 10 });

  expect(get.mock.calls.length).toBe(1);
  expect(get.mock.calls[0][0]).toBe('test-url');
  expect(get.mock.calls[0][1]).toEqual({
    param1: 'value1',
    param2: 'value2',
    search: 'testSearch',
    currentPage: 10,
    offset: 3,
  });
});

test('should not send page if page param name falsy', async () => {
  const get = jest.fn();

  const page = setup({
    url: 'test-url',
    queryParams: {
      param1: 'value1',
      param2: 'value2',
    },
    pageParamName: null,
    get,
  });

  await page.loadOptions('testSearch', [1, 2, 3], { page: 10 });

  expect(get.mock.calls.length).toBe(1);
  expect(get.mock.calls[0][0]).toBe('test-url');
  expect(get.mock.calls[0][1]).toEqual({
    param1: 'value1',
    param2: 'value2',
    search: 'testSearch',
    offset: 3,
  });
});

test('should redefine offset param name', async () => {
  const get = jest.fn();

  const page = setup({
    url: 'test-url',
    queryParams: {
      param1: 'value1',
      param2: 'value2',
    },
    offsetParamName: 'otherOffset',
    get,
  });

  await page.loadOptions('testSearch', [1, 2, 3], { page: 10 });

  expect(get.mock.calls.length).toBe(1);
  expect(get.mock.calls[0][0]).toBe('test-url');
  expect(get.mock.calls[0][1]).toEqual({
    param1: 'value1',
    param2: 'value2',
    search: 'testSearch',
    page: 10,
    otherOffset: 3,
  });
});

test('should not send offset if offset param name falsy', async () => {
  const get = jest.fn();

  const page = setup({
    url: 'test-url',
    queryParams: {
      param1: 'value1',
      param2: 'value2',
    },
    offsetParamName: null,
    get,
  });

  await page.loadOptions('testSearch', [1, 2, 3], { page: 10 });

  expect(get.mock.calls.length).toBe(1);
  expect(get.mock.calls[0][0]).toBe('test-url');
  expect(get.mock.calls[0][1]).toEqual({
    param1: 'value1',
    param2: 'value2',
    search: 'testSearch',
    page: 10,
  });
});

test('should return response with increased page in additional', async () => {
  const get = jest.fn(() => ({
    options: [4, 5, 6],
    hasMore: true,
  }));

  const page = setup({
    get,
  });

  const result = await page.loadOptions('testSearch', [1, 2, 3], { page: 10 });

  expect(result).toEqual({
    options: [4, 5, 6],
    hasMore: true,

    additional: {
      page: 11,
    },
  });
});

test('should return mapped response with increased page in additional', async () => {
  const response = {
    results: [4, 5, 6],
    has_more: true,
  };

  const get = jest.fn(() => response);

  const mapResponse = jest.fn(({
    results,
    has_more: hasMore,
  }) => ({
    options: results,
    hasMore,
  }));

  const page = setup({
    get,
    mapResponse,
  });

  const prevOptions = [1, 2, 3];

  const result = await page.loadOptions('testSearch', prevOptions, { page: 10 });

  expect(result).toEqual({
    options: [4, 5, 6],
    hasMore: true,

    additional: {
      page: 11,
    },
  });

  expect(mapResponse.mock.calls.length).toBe(1);
  expect(mapResponse.mock.calls[0][0]).toBe(response);
  expect(mapResponse.mock.calls[0][1].search).toBe('testSearch');
  expect(mapResponse.mock.calls[0][1].prevPage).toBe(10);
  expect(mapResponse.mock.calls[0][1].prevOptions).toBe(prevOptions);
});

test('should return empty response on error', async () => {
  const get = jest.fn(() => {
    throw new Error('Test error');
  });

  const page = setup({
    get,
  });

  const result = await page.loadOptions('testSearch', [1, 2, 3], { page: 10 });

  expect(result).toEqual({
    options: [],
    hasMore: false,
  });
});
