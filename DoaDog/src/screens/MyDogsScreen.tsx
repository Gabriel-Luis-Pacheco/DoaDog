import React, { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AppButton from '../components/AppButton';
import DogCard from '../components/DogCard';
import EmptyState from '../components/EmptyState';
import IllustratedHeader from '../components/IllustratedHeader';
import ScreenContainer from '../components/ScreenContainer';
import SectionHeader from '../components/SectionHeader';
import { dogServices } from '../services/api';
import { spacing } from '../theme/theme';
import { Dog } from '../types';

export default function MyDogsScreen() {
  const navigation = useNavigation<any>();
  const [dogs, setDogs] = useState<Dog[]>([]);

  const loadDogs = async () => {
    const { data } = await dogServices.getMyDogs();
    setDogs(data);
  };

  useFocusEffect(
    useCallback(() => {
      loadDogs();
    }, [])
  );

  const goToRegister = () => {
    navigation.getParent()?.navigate('Cadastrar' as never);
  };

  return (
    <ScreenContainer>
      <IllustratedHeader
        eyebrow="Cadastro"
        title="Meus cadastros"
        subtitle={`${dogs.length} casos salvos neste aparelho.`}
        illustration={false}
        right={<AppButton title="Cadastrar" icon="plus-circle" onPress={goToRegister} variant="outline" />}
      />

      {dogs.length === 0 ? (
        <EmptyState
          illustration="emptyDogs"
          title="Nenhum cão cadastrado"
          message="Quando você cadastrar um caso, ele aparece aqui."
          actionLabel="Cadastrar cão"
          onAction={goToRegister}
        />
      ) : (
        <View style={styles.list}>
          <SectionHeader title="Casos cadastrados" />
          {dogs.map((dog) => (
            <DogCard key={dog.id} dog={dog} onPress={() => navigation.navigate('DogDetail', { dog })} />
          ))}
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = {
  list: {
    gap: spacing.lg,
  },
};
