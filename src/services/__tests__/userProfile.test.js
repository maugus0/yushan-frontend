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

      await expect(userProfileService.sendEmailChangeVerification('exists@example.com'))
        .rejects.toThrow('Email already exists. Please use a different email.');
    });

    it('should return data when successful', async () => {
      const mockData = { code: 200, data: {} };
      axios.post.mockResolvedValue({ data: mockData });

      await expect(userProfileService.sendEmailChangeVerification('new@example.com'))
        .resolves.toEqual(mockData);
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

      await expect(userProfileService.updateProfile('123', { email: 'exists@example.com' }))
        .rejects.toThrow('Email already exists. Please use a different email.');
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