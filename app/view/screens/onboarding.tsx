import React from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ImageBackground, 
  StatusBar 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CustomButton } from '../components/CustomButton';
import { COLORS } from '../../viewmodel/constants/theme';

export default function Onboarding() {
  const navigation = useNavigation<any>();

  const handleGetStarted = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ImageBackground 
        source={require('../../../assets/images/onboarding_bg.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={styles.contentContainer}>
            {/* Logo/Icon placeholder or branding */}
            <View style={styles.logoContainer}>
              <Text style={styles.logoText}>⏰</Text>
            </View>

            <Text style={styles.title}>
              Bem-vindo{"\n"}ao Eletro-time
            </Text>
            
            <Text style={styles.subtitle}>
              Registre seu ponto e gerencie sua jornada de trabalho de forma inteligente e geolocalizada.
            </Text>

            <CustomButton 
              title="Começar" 
              onPress={handleGetStarted}
              style={styles.button}
            />
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)', // Translucent dark overlay for readability
    justifyContent: 'flex-end',
  },
  contentContainer: {
    paddingHorizontal: 25,
    paddingBottom: 50,
    alignItems: 'center',
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  logoText: {
    fontSize: 30,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    lineHeight: 54,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#FCFCFC',
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.85,
    marginBottom: 40,
    paddingHorizontal: 15,
  },
  button: {
    marginTop: 10,
  }
});
