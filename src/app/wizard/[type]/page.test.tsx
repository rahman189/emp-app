import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WizardTypePage from './page';

const mockPush = jest.fn();
const mockUseParams = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => mockUseParams(),
}));

jest.mock('@/components/AutocompleteSelect', () => {
  return function MockAutocompleteSelect(props: {
    label?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    onSelect?: (option: { name: string }) => void;
    onBlur?: () => void;
  }) {
    return (
      <label>
        <span>{props.label ?? 'Autocomplete'}</span>
        <input
          aria-label={props.label ?? 'Autocomplete'}
          value={props.value ?? ''}
          onChange={(event) => {
            const nextValue = event.target.value;
            props.onValueChange?.(nextValue);
            props.onSelect?.({ name: nextValue });
          }}
          onBlur={() => props.onBlur?.()}
        />
      </label>
    );
  };
});

jest.mock('@/components/PhotoUpload', () => {
  return function MockPhotoUpload(props: {
    onChange?: (value: string | null) => void;
  }) {
    return (
      <button type="button" onClick={() => props.onChange?.('data:image/mock')}>
        Upload mock photo
      </button>
    );
  };
});

jest.mock('@/components/Toast', () => {
  return function MockToast() {
    return null;
  };
});

describe('WizardTypePage submit flow', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ type: 'admin' });
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
    window.localStorage.clear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows submit progress and posts basic info then details sequentially', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    render(<WizardTypePage />);

    await user.type(screen.getByPlaceholderText('Jane Cooper'), 'Jane Cooper');
    await user.type(
      screen.getByPlaceholderText('jane@company.com'),
      'jane@company.com'
    );
    await user.type(screen.getByLabelText('Department'), 'Engineering');
    await user.selectOptions(screen.getByLabelText('Role'), 'Admin');

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await user.click(screen.getByRole('button', { name: 'Upload mock photo' }));
    await user.selectOptions(
      screen.getByLabelText('Employee type'),
      'Full-time'
    );
    await user.type(screen.getByLabelText('Office location'), 'Jakarta');

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    expect(
      screen.getByRole('button', { name: 'Submitting basic info...' })
    ).toBeDisabled();

    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe('/basicInfo');
    expect(
      screen.getByRole('button', {
        name: 'Basic info saved. Submitting details...',
      })
    ).toBeDisabled();

    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    expect((global.fetch as jest.Mock).mock.calls[1][0]).toBe('/details');
    expect(
      screen.getByRole('button', { name: 'All data saved' })
    ).toBeDisabled();

    const firstBody = JSON.parse(
      ((global.fetch as jest.Mock).mock.calls[0][1] as RequestInit)
        .body as string
    );
    const secondBody = JSON.parse(
      ((global.fetch as jest.Mock).mock.calls[1][1] as RequestInit)
        .body as string
    );

    expect(firstBody).toMatchObject({
      fullname: 'Jane Cooper',
      email: 'jane@company.com',
      department: 'Engineering',
      role: 'Admin',
    });
    expect(secondBody).toMatchObject({
      employmentType: 'Full-time',
      officeLocation: 'Jakarta',
      photo: 'data:image/mock',
    });
  });
});
