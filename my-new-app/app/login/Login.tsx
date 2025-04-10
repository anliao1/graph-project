'use client';

import * as React from 'react';
import { updateStreak } from '../streak';
import { Box, Button, Typography, createTheme, ThemeProvider } from '@mui/material';
import { Google } from '@mui/icons-material';
import { auth, signInWithGoogle } from '../Firebase';
import { useRouter } from 'next/navigation';
import { useUser } from '../context/UserContext';

const vibrantTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#00c853',
    },
    background: {
      default: '#f0f2f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '50px',
          textTransform: 'none',
          padding: '10px 20px',
        },
      },
    },
  },
  typography: {
    fontFamily: 'Poppins, sans-serif',
    h5: {
      fontWeight: 'bolder',
    },
    body1: {
      fontSize: '1.2rem',
    },
  },
});

const Login: React.FC = () => {
  const router = useRouter();
  const { setUser } = useUser();

  const handleGoogleLogin = async () => {
    try {
        const result = await signInWithGoogle();
        const user = result.user;
    
        if (!user) throw new Error("Login failed.");
    
        setUser(user);
    
        // Wait for auth.currentUser to match the newly signed-in user
        await new Promise((resolve) => {
          const unsub = auth.onAuthStateChanged((authUser) => {
            if (authUser?.uid === user.uid) {
              resolve(null);
              unsub();
            }
          });
        });
    
        await updateStreak(); // now safe to call
        router.push('/');
      } catch (error) {
        console.error('Error during sign-in:', error);
      }
    };

  return (
    <ThemeProvider theme={vibrantTheme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <Box
          sx={{
            width: '400px',
            height: '200px',
            padding: 4,
            boxShadow: 3,
            borderRadius: 2,
            backgroundColor: 'background.paper',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h5" sx={{ mb: 2, color: 'text.primary' }}>
            GraphQuest
          </Typography>
          <Button
            variant="contained"
            startIcon={<Google sx={{ color: '#DB4437' }} />}
            onClick={handleGoogleLogin}
            sx={{
              backgroundColor: 'transparent',
              boxShadow: 3,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          >
            Login with Google
          </Button>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Login;