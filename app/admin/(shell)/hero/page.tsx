import { HeroEditor } from "./HeroEditor";
import { getHeroForEdit } from "./data";

export default async function HeroPage() {
  const hero = await getHeroForEdit();
  return <HeroEditor hero={hero} />;
}
