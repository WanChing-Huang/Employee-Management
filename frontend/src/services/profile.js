import api from './api';

export const getMyProfile = async () => {
  try {
    const response = await api.get('/profiles/my-profile');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch profile');
  }
};

export const submitOnboarding = async (formData) => {
  try {
    const form = new FormData();

    // ✅ 只保留 data 欄位
    form.append('data', JSON.stringify(formData));

    // ✅ 檔案處理
    if (formData.files) {
      Object.keys(formData.files).forEach((key) => {
        if (formData.files[key]) {
          form.append(key, formData.files[key]);
        }
      });
    }

    const response = await api.post('/profiles/onboarding', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to submit onboarding');
  }
};


// export const submitOnboarding = async (formData) => {
//   try {
//     const form = new FormData();

//     // 將每個欄位分別處理
//     Object.entries(formData).forEach(([key, value]) => {
//       if (value === null || value === undefined || key === 'files') return;

//       // 這些欄位直接加進 FormData，因為 Mongoose 能自己處理 object/array
//       if (
//         ['address', 'reference', 'workAuthorization', 'emergencyContacts'].includes(key)
//       ) {
//         form.append(key, new Blob([JSON.stringify(value)], { type: 'application/json' }));
//         return;
//       }

//       // 原生資料型別（string, boolean, number, date string）
//       if (
//         typeof value === 'string' ||
//         typeof value === 'boolean' ||
//         value instanceof Date
//       ) {
//         form.append(key, value);
//       }
//     });

//     // 檔案處理
//     if (formData.files) {
//       Object.keys(formData.files).forEach((key) => {
//         if (formData.files[key]) {
//           form.append(key, formData.files[key]);
//         }
//       });
//     }

//     const response = await api.post('/profiles/onboarding', form, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });

//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.error || 'Failed to submit onboarding');
//   }
// };

    
    
export const updatePersonalInfo = async (section, data) => {
  try {
    const response = await api.put(`/profiles/personal-info/${section}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to update personal info');
  }
};