import React from 'react';
import { TextField, MenuItem } from '@mui/material';
import { Controller } from 'react-hook-form';

const FormInput = ({
  name,
  control,
  label,
  type = 'text',
  required = false,
  disabled = false,
  multiline = false,
  rows = 1,
  select = false,
  options = [],
  rules = {},
  ...otherProps
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={{
        required: required ? `${label} is required` : false,
        ...rules,
      }}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          value={field.value ?? ''} 
          label={label}
          type={type}
          fullWidth
          disabled={disabled}
          multiline={multiline}
          rows={rows}
          select={select}
          error={!!error}
          helperText={error?.message}
          variant="outlined"
          {...otherProps}
        >
          {select && options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
};

export default FormInput;