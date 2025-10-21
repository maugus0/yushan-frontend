import userProfileService from '../userProfile';
import axios from 'axios';

jest.mock('axios');

describe('userProfileService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendEmailChangeVerification', () => {
    it('should throw error when email already exists', async () => {
      const error = {
        response: {
          status: 409,
          data: { message: 'Email already exists' },
        },
      };
      axios.post.mockRejectedValue(error);

      await expect(
        userProfileService.sendEmailChangeVerification('exists@example.com')
      ).rejects.toThrow('Email already exists. Please use a different email.');
    });

    it('should return data when successful', async () => {
      const mockData = { code: 200, data: {} };
      axios.post.mockResolvedValue({ data: mockData });

      await expect(
        userProfileService.sendEmailChangeVerification('new@example.com')
      ).resolves.toEqual(mockData);
    });
  });

  describe('updateProfile', () => {
    it('should throw error when email already exists', async () => {
      const error = {
        response: {
          status: 409,
          data: { message: 'Email already exists' },
        },
      };
      axios.put.mockRejectedValue(error);

      await expect(
        userProfileService.updateProfile('123', { email: 'exists@example.com' })
      ).rejects.toThrow('Email already exists. Please use a different email.');
    });

    it('should return transformed data when successful', async () => {
      const mockResponse = {
        data: {
          code: 200,
          data: {
            profile: {
              uuid: '123',
              email: 'new@example.com',
              username: 'testuser',
              avatarUrl: '',
              profileDetail: '',
              birthday: null,
              gender: 'MALE',
              isAuthor: false,
              isAdmin: false,
              level: 1,
              exp: 0,
              readTime: 0,
              readBookNum: 0,
              status: 1,
              createTime: new Date().toISOString(),
              updateTime: new Date().toISOString(),
              lastActive: new Date().toISOString(),
            },
            emailChanged: false,
            accessToken: 'token',
            refreshToken: 'refresh',
          },
        },
      };

      axios.put.mockResolvedValue(mockResponse);

      const result = await userProfileService.updateProfile('123', { username: 'testuser' });
      expect(result.data.uuid).toBe('123');
      expect(result.data.email).toBe('new@example.com');
    });
  });
});

describe('userProfileService - additional coverage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ===== getCurrentUser =====
  test('getCurrentUser - success with valid data', async () => {
    const mockUser = { uuid: 'u1', email: 'a@b.com', username: 'user', gender: 'MALE' };
    axios.get.mockResolvedValue({ data: { code: 200, data: mockUser } });

    const res = await userProfileService.getCurrentUser();
    expect(res.data.uuid).toBe('u1');
    expect(res.data.gender).toBe(1); // from GENDER_MAP
  });

  test('getCurrentUser - code not 200', async () => {
    axios.get.mockResolvedValue({ data: { code: 400, data: null } });
    const res = await userProfileService.getCurrentUser();
    expect(res.code).toBe(400);
  });

  test('getCurrentUser - throws on error', async () => {
    axios.get.mockRejectedValue(new Error('fetch failed'));
    await expect(userProfileService.getCurrentUser()).rejects.toThrow('fetch failed');
  });

  // ===== updateProfile - success JSON path =====
  test('updateProfile - success JSON update', async () => {
    const mockProfile = { uuid: '123', email: 'json@example.com', gender: 'FEMALE' };
    axios.put.mockResolvedValue({
      data: { code: 200, data: { profile: mockProfile, emailChanged: false } },
    });

    const res = await userProfileService.updateProfile('123', { username: 'u', gender: 'FEMALE' });
    expect(res.data.email).toBe('json@example.com');
    expect(res.data.gender).toBe(2);
  });

  // ===== updateProfile - with File upload =====
  test('updateProfile - with file upload', async () => {
    const mockFile = new File(['abc'], 'avatar.png', { type: 'image/png' });
    const mockProfile = { uuid: 'f1', email: 'file@x.com', gender: 'MALE' };
    axios.put.mockResolvedValue({
      data: { code: 200, data: { profile: mockProfile, emailChanged: true } },
    });

    const res = await userProfileService.updateProfile('f1', {
      username: 'fileuser',
      avatarFile: mockFile,
      gender: 'MALE',
    });

    expect(res.data.uuid).toBe('f1');
    expect(res.data.gender).toBe(1);
  });

  // ===== updateProfile - error branches =====
  const errorCases = [
    [400, 'Invalid profile data. Please check all fields'],
    [401, 'Session expired. Please login again'],
    [403, 'You do not have permission to update this profile'],
    [409, 'Email already in use'],
    [422, 'Invalid verification code or code expired'],
    [413, 'Avatar file is too large. Maximum size is 5MB'],
    [415, 'Unsupported file type. Please upload an image file'],
  ];

  test.each(errorCases)('updateProfile - handles status %i', async (status, expectedMsg) => {
    axios.put.mockRejectedValue({ response: { status, data: {} } });
    await expect(userProfileService.updateProfile('123', {})).rejects.toThrow(expectedMsg);
  });

  test('updateProfile - 500 returns backend message', async () => {
    axios.put.mockRejectedValue({
      response: { status: 500, data: { message: 'Internal server error' } },
    });
    await expect(userProfileService.updateProfile('1', {})).rejects.toThrow(
      'Internal server error'
    );
  });

  test('updateProfile - email already exists message check', async () => {
    axios.put.mockRejectedValue({
      response: { status: 400, data: { message: 'Email already exists' } },
    });
    await expect(userProfileService.updateProfile('1', {})).rejects.toThrow(
      'Email already exists. Please use a different email.'
    );
  });

  test('updateProfile - network error (request exists)', async () => {
    axios.put.mockRejectedValue({ request: {} });
    await expect(userProfileService.updateProfile('1', {})).rejects.toThrow(
      'Network error. Please check your internet connection'
    );
  });

  test('updateProfile - generic error message', async () => {
    axios.put.mockRejectedValue(new Error('Unexpected issue'));
    await expect(userProfileService.updateProfile('1', {})).rejects.toThrow('Unexpected issue');
  });

  // ===== sendEmailChangeVerification - various errors =====
  const emailErrorCases = [
    [400, 'Invalid email address'],
    [401, 'Session expired. Please login again'],
    [429, 'Too many requests. Please wait before trying again'],
    [500, 'Server error. Please try again later'],
  ];

  test.each(emailErrorCases)(
    'sendEmailChangeVerification - status %i',
    async (status, expected) => {
      axios.post.mockRejectedValue({ response: { status, data: {} } });
      await expect(userProfileService.sendEmailChangeVerification('a@b.com')).rejects.toThrow(
        expected
      );
    }
  );

  test('sendEmailChangeVerification - email already exists', async () => {
    axios.post.mockRejectedValue({
      response: { status: 400, data: { message: 'Email already exists' } },
    });
    await expect(userProfileService.sendEmailChangeVerification('a@b.com')).rejects.toThrow(
      'Email already exists. Please use a different email.'
    );
  });

  test('sendEmailChangeVerification - network request error', async () => {
    axios.post.mockRejectedValue({ request: {} });
    await expect(userProfileService.sendEmailChangeVerification('a@b.com')).rejects.toThrow(
      'Network error. Please check your internet connection'
    );
  });

  test('sendEmailChangeVerification - generic error', async () => {
    axios.post.mockRejectedValue(new Error('Unknown fail'));
    await expect(userProfileService.sendEmailChangeVerification('a@b.com')).rejects.toThrow(
      'Unknown fail'
    );
  });

  // ===== getUserById =====
  test('getUserById - success', async () => {
    axios.get.mockResolvedValue({ data: { data: { id: 'u2', name: 'user2' } } });
    const res = await userProfileService.getUserById('u2');
    expect(res.id).toBe('u2');
  });
});
