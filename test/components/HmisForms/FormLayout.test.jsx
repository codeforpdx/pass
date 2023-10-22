import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter as Router } from 'react-router-dom';
import { expect, it, describe } from 'vitest';
import { FormLayout, HMIS_FORM_LIST } from '@components/HmisForms';

const renderLayout = (route) =>
  render(
    <Router initialEntries={[`/${route}`]}>
      <FormLayout />
    </Router>
  );

describe('HMIS Form Layout', () => {
  it('creates a next button that navigates to the next element in the HMIS list', () => {
    const [firstRoute, secondRoute] = HMIS_FORM_LIST;
    const { getByRole } = renderLayout(firstRoute.path);
    expect(getByRole('link').getAttribute('href')).toBe(`/${secondRoute.path}`);
  });
  it('creates a prev button that navigates to the previous element in the HMIS list', () => {
    const lastRoute = HMIS_FORM_LIST[HMIS_FORM_LIST.length - 1];
    const prevRoute = HMIS_FORM_LIST[HMIS_FORM_LIST.length - 2];
    const { getByRole } = renderLayout(lastRoute.path);
    expect(getByRole('link').getAttribute('href')).toBe(`/${prevRoute.path}`);
  });
  it('does not create a next button on the last page', () => {
    const [firstRoute, secondRoute] = HMIS_FORM_LIST;
    const { queryAllByRole } = renderLayout(firstRoute.path);
    expect(queryAllByRole('link').length).toEqual(1);
    expect(queryAllByRole('link')[0].getAttribute('href')).toBe(`/${secondRoute.path}`);
  });
  it('does not create a prev button on the first page', () => {
    const lastRoute = HMIS_FORM_LIST[HMIS_FORM_LIST.length - 1];
    const prevRoute = HMIS_FORM_LIST[HMIS_FORM_LIST.length - 2];
    const { queryAllByRole } = renderLayout(lastRoute.path);
    expect(queryAllByRole('link').length).toEqual(1);
    expect(queryAllByRole('link')[0].getAttribute('href')).toBe(`/${prevRoute.path}`);
  });
});
