'use client';
/* eslint-disable next/no-img-element -- Static local character sprites are composited as layers. */

import { useMemo, useState } from 'react';
import {
  Backpack,
  Coins,
  Crown,
  Flame,
  Hammer,
  Pencil,
  Sparkles,
  Swords,
  Shield,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { CharacterStage } from '@/components/character/CharacterStage';
import {
  COSTUMES,
  GENDER_NAMES,
  GENDERS,
  SLOT_NAMES,
  STAT_NAMES,
  STATS,
  fa,
  type Gender,
  type Slot,
} from '@/lib/game/content';
import { characterLayers } from '@/lib/game/character-art';
import {
  activeTitle,
  baseOf,
  derived,
  previewCostume as withCostume,
  previewEquipment,
  sellPrice,
  smeltDust,
  type ItemInstance,
} from '@/lib/game/engine';
import {
  Comparison,
  ItemIcon,
  ItemStatsList,
  ItemTile,
  ItemTitle,
  pct,
  type ViewProps,
} from './ui';

const LEFT: Slot[] = ['helmet', 'weapon', 'gloves', 'ring'];
const RIGHT: Slot[] = ['amulet', 'shield', 'armor', 'boots'];

export function OverviewView({
  game,
  now,
  ready,
  act,
  go,
  justCreated,
  onRename,
}: ViewProps & { justCreated: boolean; onRename: () => void }) {
  const [tab, setTab] = useState<'bag' | 'wardrobe'>('bag');
  const [selected, setSelected] = useState<string | null>(null);
  const [previewCostume, setPreviewCostume] = useState<
    string | null | undefined
  >(undefined);
  const [revealGear, setRevealGear] = useState(false);
  const [editAppearance, setEditAppearance] = useState(false);
  const [draftGender, setDraftGender] = useState<Gender | null>(
    game.appearance.gender,
  );

  const selectedItem: ItemInstance | null =
    game.bag.find((i) => i.uid === selected) ??
    Object.values(game.equipment).find((i) => i?.uid === selected) ??
    null;
  const selectedWorn =
    !!selectedItem &&
    game.equipment[baseOf(selectedItem).slot]?.uid === selectedItem.uid;
  const display = useMemo(() => {
    let next = game;
    if (selectedItem && !selectedWorn && selectedItem.level <= game.level)
      next = previewEquipment(next, baseOf(selectedItem).slot, selectedItem);
    if (previewCostume !== undefined) next = withCostume(next, previewCostume);
    return next;
  }, [game, selectedItem, selectedWorn, previewCostume]);
  const d = derived(game, now);
  const gender = display.appearance.gender;
  const layers = gender
    ? characterLayers(
        gender,
        display.equipment,
        display.appearance.activeCostumeId,
        revealGear,
      )
    : null;
  const title = activeTitle(game);

  const slotButton = (slot: Slot) => {
    const item = game.equipment[slot];
    return (
      <button
        type="button"
        key={slot}
        className={
          'doll-slot' +
          (item ? ` q${item.quality}` : ' empty') +
          (item && selected === item.uid ? ' selected' : '')
        }
        onClick={() => item && setSelected(item.uid)}
        aria-label={`${SLOT_NAMES[slot]}: ${item ? '' : 'خالی'}`}
      >
        <ItemIcon item={item} slot={slot} />
        {item?.upgrade ? (
          <span className="tile-upgrade">+{fa(item.upgrade)}</span>
        ) : null}
        <small>{SLOT_NAMES[slot]}</small>
      </button>
    );
  };

  return (
    <>
      {justCreated && (
        <div className="panel setup-success">
          <p>
            پهلوانت آماده است. تجهیزات را ببین، سپس نخستین لشکرکشی را آغاز کن.
          </p>
          <Button onClick={() => go('expedition')}>نخستین لشکرکشی</Button>
        </div>
      )}
      <div className="panel hero-summary">
        <div className="hero-identity">
          {game.appearance.gender && (
            <img
              className="hero-portrait"
              src={`/art/character/${game.appearance.gender}-portrait.png`}
              alt=""
            />
          )}
          <div>
            <span className="eyebrow">
              <Crown /> {title.name}
            </span>
            <h2>{game.name}</h2>
            <p>
              سطح {fa(game.level)} · آبرو {fa(game.honour)} · نام{' '}
              {fa(game.fame)} · {fa(game.counters.wins)} پیروزی
            </p>
          </div>
        </div>
        <div className="hero-summary-actions">
          <Button
            variant="outline"
            disabled={!ready}
            onClick={() => go('titles')}
          >
            <Crown /> لقب‌ها
          </Button>
          <Button
            variant="outline"
            disabled={!ready}
            onClick={() => setEditAppearance(true)}
          >
            ویرایش ظاهر
          </Button>
          <Button variant="outline" disabled={!ready} onClick={onRename}>
            <Pencil /> تغییر نام
          </Button>
        </div>
      </div>

      <div className="overview-grid">
        <div>
          <div className="doll">
            <div className="doll-col">{LEFT.map(slotButton)}</div>
            <div className="doll-stage">
              <CharacterStage
                layers={layers}
                preview={display !== game}
                label={`پهلوان ${game.name}`}
              />
              {game.appearance.activeCostumeId && (
                <label className="reveal-gear">
                  <input
                    type="checkbox"
                    checked={revealGear}
                    onChange={(e) => setRevealGear(e.target.checked)}
                  />
                  نمایش تجهیزات زیر پوشاک
                </label>
              )}
            </div>
            <div className="doll-col">{RIGHT.map(slotButton)}</div>
          </div>
          <div className="panel combat-sheet">
            <h3>توان نبرد</h3>
            <div className="sheet-grid">
              <span>
                <Swords /> آسیب{' '}
                <b>
                  {fa(d.min)}–{fa(d.max)}
                </b>
              </span>
              <span>
                <Shield /> زره <b>{fa(d.armor)}</b>
              </span>
              <span>
                <Heart /> سلامتی <b>{fa(d.maxHp)}</b>
              </span>
              <span>
                کاهش آسیب <b>{pct(d.reduction)}</b>
              </span>
              <span>
                ضربهٔ بحرانی <b>{pct(d.crit)}</b>
              </span>
              <span>
                جاخالی <b>{pct(d.dodge)}</b>
              </span>
              <span>
                سد <b>{pct(d.block)}</b>
              </span>
              <span>
                ضربت دوگانه <b>{pct(d.double)}</b>
              </span>
            </div>
            <div className="sheet-stats">
              {STATS.map((st) => (
                <span key={st}>
                  {STAT_NAMES[st]}
                  <b>{fa(d.totals[st])}</b>
                  {d.totals[st] !== game.stats[st] && (
                    <small>
                      ({fa(game.stats[st])} +{fa(d.totals[st] - game.stats[st])}
                      )
                    </small>
                  )}
                </span>
              ))}
            </div>
            <p className="info-note">
              درصدها در برابر حریف هم‌سطح است. ویژگی‌ها را در تمرین‌گاه بالا ببر.
            </p>
          </div>
        </div>

        <div className="kit-column">
          <div className="hero-tabs" role="tablist" aria-label="کیسه و پوشاک">
            <Button
              role="tab"
              aria-selected={tab === 'bag'}
              variant={tab === 'bag' ? 'secondary' : 'ghost'}
              onClick={() => {
                setTab('bag');
                setPreviewCostume(undefined);
              }}
            >
              <Backpack /> کیسه · {fa(game.bag.length)}/{fa(game.bagSize)}
            </Button>
            <Button
              role="tab"
              aria-selected={tab === 'wardrobe'}
              variant={tab === 'wardrobe' ? 'secondary' : 'ghost'}
              onClick={() => {
                setTab('wardrobe');
                setSelected(null);
              }}
            >
              <Sparkles /> پوشاک
            </Button>
            {game.packages.length > 0 && (
              <Button variant="outline" onClick={() => go('packages')}>
                {fa(game.packages.length)} بستهٔ باز نشده
              </Button>
            )}
          </div>
          {tab === 'bag' && (
            <>
              {selectedItem ? (
                <div className="panel item-detail">
                  <ItemTitle item={selectedItem} />
                  <ItemStatsList item={selectedItem} />
                  {selectedItem.level > game.level && (
                    <p className="warn-note">
                      از سطح {fa(selectedItem.level)} پوشیدنی است.
                    </p>
                  )}
                  {!selectedWorn && (
                    <Comparison game={game} item={selectedItem} />
                  )}
                  <div className="item-actions">
                    {selectedWorn ? (
                      <Button
                        variant="outline"
                        disabled={!ready || game.bag.length >= game.bagSize}
                        onClick={() =>
                          act({
                            type: 'unequip',
                            slot: baseOf(selectedItem).slot,
                          })
                        }
                      >
                        از تن خارج کن
                      </Button>
                    ) : (
                      <>
                        <Button
                          disabled={!ready || selectedItem.level > game.level}
                          onClick={() =>
                            act({ type: 'equip', uid: selectedItem.uid })
                          }
                        >
                          پوشیدن
                        </Button>
                        <Button
                          variant="outline"
                          disabled={!ready}
                          onClick={() => {
                            act({ type: 'sell', uid: selectedItem.uid });
                            setSelected(null);
                          }}
                        >
                          فروش · {fa(sellPrice(selectedItem))} <Coins />
                        </Button>
                        <Button
                          variant="outline"
                          disabled={!ready}
                          onClick={() => {
                            act({ type: 'smelt', uid: selectedItem.uid });
                            setSelected(null);
                          }}
                        >
                          گداز · {fa(smeltDust(selectedItem))} <Flame />
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" onClick={() => go('forge')}>
                      <Hammer /> آهنگری
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="info-note">
                  روی یک وسیله یا جایگاه بزن تا جزئیات و مقایسه را ببینی.
                </p>
              )}
              <div className="bag-grid" aria-label="کیسه">
                {game.bag.map((item) => (
                  <ItemTile
                    key={item.uid}
                    item={item}
                    selected={selected === item.uid}
                    locked={item.level > game.level}
                    onClick={() =>
                      setSelected(selected === item.uid ? null : item.uid)
                    }
                  />
                ))}
                {Array.from(
                  { length: Math.max(0, game.bagSize - game.bag.length) },
                  (_, i) => (
                    <span className="bag-cell" key={'e' + i} />
                  ),
                )}
              </div>
            </>
          )}
          {tab === 'wardrobe' && (
            <div className="wardrobe">
              <p className="info-note">پوشاک فقط ظاهر را تغییر می‌دهد.</p>
              <div className="wardrobe-grid">
                <button
                  type="button"
                  className={
                    'wardrobe-card' +
                    (game.appearance.activeCostumeId === null ? ' worn' : '') +
                    (previewCostume === null ? ' previewing-card' : '')
                  }
                  onClick={() => setPreviewCostume(null)}
                >
                  {gender && (
                    <img src={`/art/character/${gender}-leather.png`} alt="" />
                  )}
                  <h3>نمای تجهیزات</h3>
                  <p>زره و سلاح واقعی پهلوان را نشان بده.</p>
                </button>
                {COSTUMES.map((costume) => (
                  <button
                    type="button"
                    key={costume.id}
                    className={
                      'wardrobe-card' +
                      (game.appearance.activeCostumeId === costume.id
                        ? ' worn'
                        : '') +
                      (previewCostume === costume.id ? ' previewing-card' : '')
                    }
                    disabled={!game.ownedCostumeIds.includes(costume.id)}
                    onClick={() => setPreviewCostume(costume.id)}
                  >
                    {gender && (
                      <img
                        src={`/art/character/${gender}-${costume.id}.png`}
                        alt=""
                      />
                    )}
                    <h3>{costume.name}</h3>
                    <p>{costume.description}</p>
                  </button>
                ))}
              </div>
              {previewCostume !== undefined && (
                <div className="item-actions">
                  <Button
                    disabled={!ready}
                    onClick={() => {
                      act({ type: 'wearCostume', costumeId: previewCostume });
                      setPreviewCostume(undefined);
                    }}
                  >
                    پوشیدن لباس
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setPreviewCostume(undefined)}
                  >
                    انصراف
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Dialog open={editAppearance} onOpenChange={setEditAppearance}>
        <DialogContent dir="rtl" className="appearance-dialog">
          <DialogTitle>ویرایش ظاهر</DialogTitle>
          <DialogDescription>
            تغییر جنسیت رایگان است و پیشرفت، تجهیزات و پوشاک حفظ می‌شوند.
          </DialogDescription>
          <div className="gender-cards compact">
            {GENDERS.map((id) => (
              <label
                key={id}
                className={
                  'gender-card' + (draftGender === id ? ' selected' : '')
                }
              >
                <input
                  type="radio"
                  name="edit-gender"
                  value={id}
                  checked={draftGender === id}
                  onChange={() => setDraftGender(id)}
                />
                <img src={`/art/character/${id}-portrait.png`} alt="" />
                <span>{GENDER_NAMES[id]}</span>
              </label>
            ))}
          </div>
          <div className="setup-form">
            <Button
              disabled={!ready || !draftGender}
              onClick={() => {
                if (!draftGender) return;
                act({ type: 'setGender', gender: draftGender });
                setEditAppearance(false);
              }}
            >
              ثبت ظاهر
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
