import {
  COSTUMES,
  type CostumeId,
  type Gender,
  type Slot,
} from './content';
import type { GameState } from './engine';

export type BodyLook =
  | 'base'
  | 'leather'
  | 'scale'
  | 'guardian'
  | 'travel'
  | 'ceremonial';

const ARMOR_LOOK: Record<string, BodyLook> = {
  leather: 'leather',
  scale: 'scale',
  guardian: 'guardian',
};

const WEAPON_SRC: Record<string, string> = {
  'iron-blade': '/art/character/weapon-iron-blade.png',
  'bronze-blade': '/art/character/weapon-bronze-blade.png',
  'sun-blade': '/art/character/weapon-sun-blade.png',
};

const CHARM_SRC: Record<string, string> = {
  cypress: '/art/character/charm-cypress.png',
  simorgh: '/art/character/charm-simorgh.png',
};

export function bodySrc(gender: Gender, look: BodyLook) {
  return `/art/character/${gender}-${look}.png`;
}

export function portraitSrc(gender: Gender) {
  return `/art/character/${gender}-portrait.png`;
}

export function itemIconSrc(itemId: string) {
  return WEAPON_SRC[itemId] ?? CHARM_SRC[itemId];
}

export function armorLook(itemId: string | null): BodyLook {
  return itemId ? (ARMOR_LOOK[itemId] ?? 'base') : 'base';
}

export function resolveBodyLook(options: {
  armorId: string | null;
  costumeId: string | null;
  revealGear?: boolean;
}): BodyLook {
  if (options.costumeId && !options.revealGear) {
    if (options.costumeId === 'travel' || options.costumeId === 'ceremonial')
      return options.costumeId;
  }
  return armorLook(options.armorId);
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
  equipment: Record<Slot, string | null>,
  costumeId: string | null,
  revealGear = false,
): CharacterLayers {
  const look = resolveBodyLook({
    armorId: equipment.armor,
    costumeId,
    revealGear,
  });
  const concealsArmor = Boolean(costumeId) && !revealGear && !!equipment.armor;
  return {
    gender,
    look,
    body: bodySrc(gender, look),
    weapon: equipment.weapon ? WEAPON_SRC[equipment.weapon] : undefined,
    charm: equipment.charm ? CHARM_SRC[equipment.charm] : undefined,
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
