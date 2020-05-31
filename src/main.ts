import * as PIXI from "pixi.js";
import {GlowFilter} from '@pixi/filter-glow';
import {easeExpOut} from "d3-ease";
import bgJpg from "./bg.jpg";

const resourcesLoaded = new Promise<Partial<Record<string, PIXI.LoaderResource>>>(resolve => {
    const loader = new PIXI.Loader();
    loader.add("bg", bgJpg);
    loader.load((ld, resources) => resolve(resources));
});

function createCard(width: number, height: number, i: number) {
    const graphics = new PIXI.Graphics();
    graphics
        .lineStyle(1, 0x00ffff)
        .beginFill(0x00ffff, 0.2)
        .drawRoundedRect(0, 0, width, height, 50);
    const text = new PIXI.Text(`${i}`, {
        fontSize: 100,
        fill: 0xffffff,
    });
    text.position.set((width - text.width) / 2, 50);
    graphics.addChild(text);
    const glow = new PIXI.Graphics();
    glow
        .beginFill(0xffffff)
        .drawRoundedRect(0, 0, width, height, 50);
    glow.filters = [new GlowFilter({
        color: 0x00ffff,
        distance: 20,
        quality: 0.5,
        outerStrength: 2,
        knockout: true,
    })];

    const container = new PIXI.Container();
    container.addChild(glow, graphics);
    return container;
}

function createArrows(app: PIXI.Application, clickLeft: () => void, clickRight: () => void) {
    const left = new PIXI.Text("<", {
        fontSize: 40,
        fill: 0xffffff
    });
    const right = new PIXI.Text(">", {
        fontSize: 40,
        fill: 0xffffff
    });
    left.position.set(app.screen.width - 100, app.screen.height - 100);
    right.position.set(app.screen.width - 50, app.screen.height - 100);
    left.interactive = true;
    right.interactive = true;
    left.buttonMode = true;
    right.buttonMode = true;
    left.on("pointertap", clickLeft);
    right.on("pointertap", clickRight);
    app.stage.addChild(left, right);
}

export async function startApp(containerEl: HTMLElement): Promise<void> {
    const app = new PIXI.Application({
        antialias: true,
        resizeTo: containerEl,
    });
    containerEl.appendChild(app.view);
    const resources = await resourcesLoaded;
    const background = PIXI.Sprite.from(resources.bg!.texture);
    app.stage.addChild(background);

    const slide = new PIXI.Container();
    slide.position.set(0, 50);

    for (let i = 0; i < 1000; i++) {
        const c = createCard(300, 500, i);
        c.position.set(50 + i * 350, 0);
        slide.addChild(c);
    }

    app.stage.addChild(slide);

    let index = 0;
    let prevIndex = 0;
    let currOffset = 0;

    function accIntegerIndex(diff: number) {
        index += Math.round(diff);
    }

    containerEl.addEventListener("wheel", e => {
        accIntegerIndex(e.deltaY / 100);
    });

    createArrows(app, () => accIntegerIndex(-1), () => accIntegerIndex(1));
    const counter = new PIXI.Text(`${index}`, {fontSize: 30, fill: 0xffffff});
    counter.position.set(app.screen.width - 200, app.screen.height - 100);
    app.stage.addChild(counter);

    app.ticker.add(() => {
        currOffset += (index - currOffset) * easeExpOut(app.ticker.deltaMS / 1000);
        const rounded = Math.round(currOffset);
        for (let i = 0; i < slide.children.length; i++){
            let card = slide.children[i];
            card.visible = !(i < index - 50 || i > index + 50);
        }
        if (Math.abs(rounded - currOffset) < 1 / 350 / 2) {
            currOffset = rounded;
        }
        slide.position.x = -350 * currOffset;
        if (prevIndex !== index) {
            counter.text = `${index}`;
            prevIndex = index;
        }
    });
}
