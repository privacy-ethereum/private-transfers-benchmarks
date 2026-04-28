import { InstanceStateUpdated } from "../../generated/InstanceRegistry/InstanceRegistry";
import { TornadoCashInstance } from "../../generated/schema";
import { TornadoInstance as TornadoInstanceTemplate } from "../../generated/templates";

const ENABLED = 1;

export function handleInstanceStateUpdated(event: InstanceStateUpdated): void {
  const address = event.params.instance;
  const id = address.toHex();
  const state = event.params.state;

  let entity = TornadoCashInstance.load(id);

  if (state === ENABLED) {
    if (entity == null) {
      entity = new TornadoCashInstance(id);
      entity.address = address;
      entity.active = true;

      entity.save();

      TornadoInstanceTemplate.create(address);
    } else {
      entity.active = true;
      entity.save();
    }
  } else if (entity !== null) {
    entity.active = false;
    entity.save();
  }
}
