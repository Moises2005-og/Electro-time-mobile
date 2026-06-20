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
        <View style={styles.cardContainer}>
          {/* Logo/Icon Container */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>⏰</Text>
          </View>

          {/* Welcome Text */}
          <Text style={styles.title}>
            Bem-vindo{"\n"}ao Eletro-time
          </Text>
          
          <Text style={styles.subtitle}>
            Registre seu ponto e gerencie sua jornada de trabalho e economias de forma inteligente.
          </Text>

          {/* Primary Button */}
          <CustomButton 
            title="Começar" 
            onPress={handleGetStarted}
            style={styles.button}
          />
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
  cardContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 30,
    paddingTop: 36,
    paddingBottom: 48,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 16,
  },
  logoContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#EBF8F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#D4EFE0',
  },
  logoText: {
    fontSize: 34,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textDark,
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textGrey,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  button: {
    width: '100%',
    height: 60,
    borderRadius: 18,
  }
});
