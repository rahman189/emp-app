import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import AutocompleteSelect from './AutocompleteSelect';

type Department = {
  id: number;
  name: string;
};

describe('AutocompleteSelect', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('renders input and label', () => {
    render(
      <AutocompleteSelect<Department>
        label="Department"
        endpoint="/departments"
      />
    );

    expect(screen.getByText('Department')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type a name...')).toBeInTheDocument();
  });

  it('fetches suggestions and renders matching options', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      json: async () => [
        { id: 1, name: 'Engineering' },
        { id: 2, name: 'Operations' },
      ],
    });

    render(
      <AutocompleteSelect<Department>
        label="Department"
        endpoint="/departments"
        queryParam="name_like"
        debounceMs={400}
      />
    );

    const input = screen.getByPlaceholderText('Type a name...');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'Eng' } });

    act(() => {
      jest.advanceTimersByTime(400);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    const [firstUrl] = (global.fetch as jest.Mock).mock.calls[0];
    expect(String(firstUrl)).toContain('/departments');
    expect(String(firstUrl)).toContain('name_like=Eng');

    expect(
      await screen.findByRole('button', { name: 'Engineering' })
    ).toBeInTheDocument();
  });
});
