import AsyncStorage from '@react-native-async-storage/async-storage';
import { SelectOption } from '../components/AppSelect';

const STATES_CACHE_KEY = '@doadog:ibge:states';
const CITIES_CACHE_PREFIX = '@doadog:ibge:cities:';

interface IbgeState {
  sigla: string;
  nome: string;
}

interface IbgeCity {
  nome: string;
}

const fallbackStates: SelectOption[] = [
  { label: 'São Paulo', value: 'SP' },
  { label: 'Rio de Janeiro', value: 'RJ' },
  { label: 'Minas Gerais', value: 'MG' },
  { label: 'Bahia', value: 'BA' },
  { label: 'Paraná', value: 'PR' },
  { label: 'Rio Grande do Sul', value: 'RS' },
  { label: 'Santa Catarina', value: 'SC' },
  { label: 'Pernambuco', value: 'PE' },
  { label: 'Ceará', value: 'CE' },
  { label: 'Distrito Federal', value: 'DF' },
];

const fallbackCities: Record<string, SelectOption[]> = {
  SP: [
    { label: 'São Paulo', value: 'São Paulo' },
    { label: 'Campinas', value: 'Campinas' },
    { label: 'Santos', value: 'Santos' },
  ],
  RJ: [
    { label: 'Rio de Janeiro', value: 'Rio de Janeiro' },
    { label: 'Niterói', value: 'Niterói' },
  ],
  MG: [
    { label: 'Belo Horizonte', value: 'Belo Horizonte' },
    { label: 'Uberlândia', value: 'Uberlândia' },
  ],
};

async function readCache<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    await AsyncStorage.removeItem(key);
    return null;
  }
}

async function writeCache<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getStates(): Promise<{ data: SelectOption[]; fromCache: boolean; error?: string }> {
  const cached = await readCache<SelectOption[]>(STATES_CACHE_KEY);
  try {
    const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
    if (!response.ok) throw new Error('IBGE indisponível');
    const json = (await response.json()) as IbgeState[];
    const states = json.map((state) => ({ label: state.nome, value: state.sigla }));
    await writeCache(STATES_CACHE_KEY, states);
    return { data: states, fromCache: false };
  } catch {
    return {
      data: cached && cached.length > 0 ? cached : fallbackStates,
      fromCache: !!cached,
      error: 'Não foi possível atualizar estados pelo IBGE. Mostrando dados locais.',
    };
  }
}

export async function getCitiesByState(uf: string): Promise<{ data: SelectOption[]; fromCache: boolean; error?: string }> {
  if (!uf) return { data: [], fromCache: false };
  const cacheKey = `${CITIES_CACHE_PREFIX}${uf}`;
  const cached = await readCache<SelectOption[]>(cacheKey);

  try {
    const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
    if (!response.ok) throw new Error('IBGE indisponível');
    const json = (await response.json()) as IbgeCity[];
    const cities = json.map((city) => ({ label: city.nome, value: city.nome }));
    await writeCache(cacheKey, cities);
    return { data: cities, fromCache: false };
  } catch {
    return {
      data: cached && cached.length > 0 ? cached : fallbackCities[uf] || [],
      fromCache: !!cached,
      error: 'Não foi possível atualizar cidades pelo IBGE. Tente novamente em instantes.',
    };
  }
}
