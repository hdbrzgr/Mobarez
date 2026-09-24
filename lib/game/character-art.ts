import {
  BASE_BY_ID,
  COSTUMES,
  type CostumeId,
  type Gender,
  type Slot,
} from './content';
import type { GameState, ItemInstance } from './engine';

export type BodyLook =
  | 'base'
  | 'leather'
  | 'scale'
  | 'guardian'
  | 'travel'
  | 'ceremonial';

const WEAPON_SRC: Record<string, string> = {
  'iron-blade': '/art/character/weapon-iron-blade.png',
  'bronze-blade': '/art/character/weapon-bronze-blade.png',
  'sun-blade': '/art/character/weapon-sun-blade.png',
};

const CHARM_SRC: Record<string, string> = {
  cypress: '/art/character/charm-cypress.png',
  simorgh: '/art/character/charm-simorgh.png',
};

type Equipment = Record<Slot, ItemInstance | null>;
const artOf = (item: ItemInstance | null | undefined) =>
  item ? BASE_BY_ID.get(item.base)?.art : undefined;

export function bodySrc(gender: Gender, look: BodyLook) {
  return `/art/character/${gender}-${look}.png`;
}

export function portraitSrc(gender: Gender) {
  return `/art/character/${gender}-portrait.png`;
}

/** Only weapons, body armour and amulets have painted art; other slots use icons. */
export function itemIconSrc(item: ItemInstance) {
  const art = artOf(item);
  if (!art) return undefined;
  return WEAPON_SRC[art] ?? CHARM_SRC[art];
}

export function armorLook(item: ItemInstance | null): BodyLook {
  const art = artOf(item);
  return art === 'leather' || art === 'scale' || art === 'guardian'
    ? art
    : 'base';
}

export function resolveBodyLook(options: {
  armor: ItemInstance | null;
  costumeId: string | null;
  revealGear?: boolean;
}): BodyLook {
  if (options.costumeId && !options.revealGear) {
    if (options.costumeId === 'travel' || options.costumeId === 'ceremonial')
      return options.costumeId;
  }
  return armorLook(options.armor);
}

export type CharacterLayers = {
  gender: Gender;
  body: string;
  look: BodyLook;
  weapon?: string;
  charm?: string;
  portrait: string;
  costumeId: string | null;
  concealsArmor: boolean;
};

export function characterLayers(
  gender: Gender,
  equipment: Equipment,
  costumeId: string | null,
  revealGear = false,
): CharacterLayers {
  const look = resolveBodyLook({
    armor: equipment.armor,
    costumeId,
    revealGear,
  });
  const concealsArmor = Boolean(costumeId) && !revealGear && !!equipment.armor;
  const weaponArt = artOf(equipment.weapon);
  const charmArt = artOf(equipment.amulet);
  return {
    gender,
    look,
    body: bodySrc(gender, look),
    weapon: weaponArt ? WEAPON_SRC[weaponArt] : undefined,
    charm: charmArt ? CHARM_SRC[charmArt] : undefined,
    portrait: portraitSrc(gender),
    costumeId,
    concealsArmor,
  };
}

export function layersFromState(
  state: Pick<GameState, 'appearance' | 'equipment'>,
  revealGear = false,
): CharacterLayers | null {
  const gender = state.appearance.gender;
  if (!gender) return null;
  return characterLayers(
    gender,
    state.equipment,
    state.appearance.activeCostumeId,
    revealGear,
  );
}

export function costumeById(id: string | null) {
  return COSTUMES.find((c) => c.id === id);
}

export const COSTUME_LOOK: Record<CostumeId, BodyLook> = {
  travel: 'travel',
  ceremonial: 'ceremonial',
};
