import {Layout, Circle, CircleProps} from '@motion-canvas/2d/lib/components';
import {all, delay} from '@motion-canvas/core/lib/flow';
import {createSignal} from '@motion-canvas/core/lib/signals';
import {linear} from '@motion-canvas/core/lib/tweening';
import {Vector2} from '@motion-canvas/core/lib/types';
import {createRef} from '@motion-canvas/core/lib/utils';

export function getUpDirectionNormalized(rotation: number) {
  return new Vector2(Math.sin(rotation * (Math.PI / 180)), -Math.cos(rotation * (Math.PI / 180)));
}

export function* createBullet(startPosition: Vector2, directionAndSpeed: Vector2, duration: number, parent: Layout, props?: CircleProps) {
  const t = createSignal(0);
  const position = () => new Vector2(startPosition.x + t() * directionAndSpeed.x, startPosition.y + t() * directionAndSpeed.y);
  const bullet = new Circle({
    position,
    size: 20,
    fill: 'white',
    ...props,
  });
  yield parent.add(bullet);
  yield* all(
    t(duration, duration, linear),
    delay((3 * duration) / 4, bullet.opacity(0, duration / 4)),
    delay(duration, () => {
      bullet.remove();
    }),
  );
}

export function createTimeDisplayValue(time: number) {
  time = Math.round(time * 100) / 100;
  if (time % 1 === 0) {
    return time + '.00';
  }
  if ((time * 10) % 1 === 0) {
    return time + '0';
  }
  return time;
}
