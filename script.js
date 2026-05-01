function uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function sanitize(name) {
  return name.replace(/[^a-z0-9]/gi, "_").toLowerCase();
}

function checkImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width === 64 && img.height === 64) resolve();
      else reject("Image must be 64x64");
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject("Invalid image file");
    };

    img.src = url;
  });
}
function checkImageSize(file, maxW, maxH) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width <= maxW && img.height <= maxH) resolve();
      else reject(`Image must be max ${maxW}x${maxH}`);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject("Invalid image file");
    };

    img.src = url;
  });
}
function generateAliases(name) {
  const clean = name.replace(/_/g, " ");
  const titleCase = clean.replace(/\b\w/g, (c) => c.toUpperCase());

  return [...new Set([name, clean, titleCase, name.toUpperCase()])];
}
const MAX_BLOCKS = 50;
const packIconInput = document.getElementById("packIconInput");
const packIconBtn = document.getElementById("packIconBtn");

let packIconFile = null;

if (packIconInput && packIconBtn) {
  packIconInput.addEventListener("change", async () => {
    const file = packIconInput.files[0];
    if (!file) return;

    try {
      await checkImageSize(file, 1024, 1024);
      packIconFile = file;
      packIconBtn.textContent = file.name;
    } catch (err) {
      alert(err);
      packIconInput.value = "";
      packIconBtn.textContent = "Upload Pack Icon";
    }
  });
}
window.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("textureContainer");
  container.addEventListener("click", (e) => {
    if (e.target.classList.contains("remove-btn")) {
      const block = e.target.closest(".texture-block");

      const blocks = container.querySelectorAll(".texture-block");
      if (blocks.length === 1) return;

      block.remove();
      updateBlockNumbers();
    }
  });
  function createBlock() {
    if (container.children.length >= MAX_BLOCKS) {
      document.getElementById("addTextureBtn").disabled = true;
      return;
    }
    const block = document.createElement("div");
    block.className = "texture-block";

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "Remove";
    removeBtn.className = "remove-btn";

    const blocks = container.querySelectorAll(".texture-block");
    const index = blocks.length + 1;

    const title = document.createElement("h4");
    title.textContent = `Texture #${index}`;
    block.appendChild(title);

    block.appendChild(removeBtn);
    removeBtn.style.display = index === 1 ? "none" : "block";

    const modeLabel = document.createElement("div");
    modeLabel.className = "label";
    modeLabel.textContent = "Mode";

    const modeSelect = document.createElement("select");
    modeSelect.innerHTML = `
      <option value="default">Default</option>
      <option value="slim">Slim</option>
      <option value="glowing">Glowing</option>
    `;

    block.appendChild(modeLabel);
    block.appendChild(modeSelect);

    const nameLabel = document.createElement("div");
    nameLabel.className = "label";
    nameLabel.textContent = "Texture Name";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "texture name";

    block.appendChild(nameLabel);
    block.appendChild(nameInput);

    const fileLabel = document.createElement("div");
    fileLabel.className = "label";
    fileLabel.textContent = "Base Texture";

    const fileWrapper1 = document.createElement("div");
    fileWrapper1.className = "file-wrapper";

    const file1 = document.createElement("input");
    file1.type = "file";
    file1.accept = "image/png";

    const fileBtn1 = document.createElement("div");
    fileBtn1.className = "file-button";
    fileBtn1.textContent = "Upload Base Texture";

    file1.addEventListener("change", () => {
      if (file1.files[0]) {
        fileBtn1.textContent = file1.files[0].name;
      }
    });

    fileWrapper1.appendChild(fileBtn1);
    fileWrapper1.appendChild(file1);

    block.appendChild(fileLabel);
    block.appendChild(fileWrapper1);

    const glowWrapper = document.createElement("div");
    glowWrapper.style.display = "none";

    const glowLabel = document.createElement("div");
    glowLabel.className = "label";
    glowLabel.textContent = "Glowing Texture";

    const fileWrapper2 = document.createElement("div");
    fileWrapper2.className = "file-wrapper";

    const file2 = document.createElement("input");
    file2.type = "file";
    file2.accept = "image/png";

    const fileBtn2 = document.createElement("div");
    fileBtn2.className = "file-button";
    fileBtn2.textContent = "Upload Glowing Texture";

    file2.addEventListener("change", () => {
      if (file2.files[0]) {
        fileBtn2.textContent = file2.files[0].name;
      }
    });

    fileWrapper2.appendChild(fileBtn2);
    fileWrapper2.appendChild(file2);

    glowWrapper.appendChild(glowLabel);
    glowWrapper.appendChild(fileWrapper2);

    block.appendChild(glowWrapper);
    modeSelect.addEventListener("change", () => {
      glowWrapper.style.display =
        modeSelect.value === "glowing" ? "block" : "none";
    });

    container.appendChild(block);
  }
  createBlock();

  document.getElementById("addTextureBtn").addEventListener("click", () => {
    createBlock();
  });
  function updateBlockNumbers() {
    const blocks = container.querySelectorAll(".texture-block");

    blocks.forEach((blk, i) => {
      const title = blk.querySelector("h4");
      if (title) title.textContent = `Texture #${i + 1}`;

      const removeBtn = blk.querySelector(".remove-btn");

      if (removeBtn) {
        removeBtn.style.display = i === 0 ? "none" : "block";
      }
    });
  }
});
async function generate() {
  const blocks = document
    .getElementById("textureContainer")
    .querySelectorAll(".texture-block");
  const textures = [];

  for (let block of blocks) {
    const mode = block.querySelector("select").value;
    const name = block.querySelector("input[type='text']").value;
    const fileInputs = block.querySelectorAll(".file-wrapper input");
    const file1 = fileInputs[0]?.files[0];
    const file2 = fileInputs[1]?.files[0];

    if (!name || !file1) {
      console.warn("Skipped empty block");
      continue;
    }
    const cleanName = sanitize(name);

    if (textures.some((t) => t.name === cleanName)) {
      return alert(`Duplicate texture name: ${name}`);
    }

    textures.push({
      name: cleanName,
      file1,
      file2,
      mode,
    });
  }

  if (textures.length === 0) {
    return alert("Add at least one texture");
  }

  try {
    for (let tex of textures) {
      await checkImage(tex.file1);

      if (tex.mode === "glowing" && !tex.file2) {
        return alert(`Missing glowing texture for ${tex.name}`);
      }

      if (tex.mode === "glowing" && tex.file2) {
        await checkImage(tex.file2);
      }
    }
  } catch (e) {
    return alert(e);
  }

  const zip = new JSZip();
  const texFolder = zip.folder("textures").folder("custom_armor_stand");
  try {
    if (packIconFile) {
      zip.file("pack_icon.png", packIconFile);
    } else {
      const response = await fetch("pack_icon.png");
      if (!response.ok) throw new Error();
      const blob = await response.blob();
      zip.file("pack_icon.png", blob);
    }
  } catch {
    console.warn("Default pack_icon.png not found");
  }
  textures.forEach((tex) => {
    texFolder.file(`${tex.name}.png`, tex.file1);

    if (tex.mode === "glowing" && tex.file2) {
      texFolder.file(`${tex.name}_glowing.png`, tex.file2);
    }
  });
  const rawName = document.getElementById("name").value || "Pack";
  const packName = rawName;
  const safeName = sanitize(rawName);
  const manifest = {
    format_version: 2,
    header: {
      name: packName,
      description: "Made with ❤ by Team Nicverse",
      uuid: uuidv4(),
      version: [1, 0, 0],
      min_engine_version: [1, 21, 0],
    },
    metadata: {
      author: "Team Nicverse",
    },
    modules: [
      {
        type: "resources",
        uuid: uuidv4(),
        version: [1, 0, 0],
      },
    ],
  };

  zip.file("manifest.json", JSON.stringify(manifest, null, 2));

  const entityJson = {
    format_version: "1.10.0",
    "minecraft:client_entity": {
      description: {
        identifier: "minecraft:armor_stand",
        min_engine_version: "1.8.0",
        materials: {
          default: "entity_alphatest",
        },
        textures: {
          default: "textures/entity/armor_stand/wood/oak",
          none: "textures/entity/llama/decor/decor_none",
          anime_gojo: "textures/entity/armor_stand/anime/gojo",
          anime_goku: "textures/entity/armor_stand/anime/goku",
          anime_luffy: "textures/entity/armor_stand/anime/luffy",
          anime_naruto: "textures/entity/armor_stand/anime/naruto",
          anime_madara: "textures/entity/armor_stand/anime/madara",
          anime_sukuna: "textures/entity/armor_stand/anime/sukuna",
          anime_tanjiro: "textures/entity/armor_stand/anime/tanjiro",
          anime_yuji: "textures/entity/armor_stand/anime/yuji",
          extra_dummy: "textures/entity/armor_stand/extra/dummy",
          extra_halloween: "textures/entity/armor_stand/extra/halloween",
          extra_chad: "textures/entity/armor_stand/extra/chad",
          extra_halloween_glowing:
            "textures/entity/armor_stand/extra/halloween_glowing",
          extra_showcase: "textures/entity/armor_stand/extra/showcase",
          minecraft_alex: "textures/entity/armor_stand/minecraft/alex",
          minecraft_herobrine:
            "textures/entity/armor_stand/minecraft/herobrine",
          minecraft_herobrine_glowing:
            "textures/entity/armor_stand/minecraft/herobrine_glowing",
          minecraft_notch: "textures/entity/armor_stand/minecraft/notch",
          minecraft_old_alex: "textures/entity/armor_stand/minecraft/old_alex",
          minecraft_old_steve:
            "textures/entity/armor_stand/minecraft/old_steve",
          minecraft_steve: "textures/entity/armor_stand/minecraft/steve",
          special_alexxander: "textures/entity/armor_stand/special/alexxander",
          special_amr9445: "textures/entity/armor_stand/special/amr9445",
          special_amr9445_glowing:
            "textures/entity/armor_stand/special/amr9445_glowing",
          special_darkshadow: "textures/entity/armor_stand/special/darkshadow",
          special_darkshadow_glowing:
            "textures/entity/armor_stand/special/darkshadow_glowing",
          special_keshew: "textures/entity/armor_stand/special/keshew",
          special_keshew_glowing:
            "textures/entity/armor_stand/special/keshew_glowing",
          special_legend: "textures/entity/armor_stand/special/legend",
          special_legend_glowing:
            "textures/entity/armor_stand/special/legend_glowing",
          special_lostliano: "textures/entity/armor_stand/special/lostliano",
          special_newvietnam: "textures/entity/armor_stand/special/newvietnam",
          special_newvietnam_glowing:
            "textures/entity/armor_stand/special/newvietnam_glowing",
          special_nic: "textures/entity/armor_stand/special/nic",
          special_nic_glowing:
            "textures/entity/armor_stand/special/nic_glowing",
          special_nx703: "textures/entity/armor_stand/special/nx703",
          special_saif: "textures/entity/armor_stand/special/saif",
          special_saif_glowing:
            "textures/entity/armor_stand/special/saif_glowing",
          special_sed: "textures/entity/armor_stand/special/sed",
          special_supermario: "textures/entity/armor_stand/special/supermario",
          wood_acacia: "textures/entity/armor_stand/wood/acacia",
          wood_bamboo: "textures/entity/armor_stand/wood/bamboo",
          wood_birch: "textures/entity/armor_stand/wood/birch",
          wood_cherry: "textures/entity/armor_stand/wood/cherry",
          wood_crimson: "textures/entity/armor_stand/wood/crimson",
          wood_dark_oak: "textures/entity/armor_stand/wood/dark_oak",
          wood_jungle: "textures/entity/armor_stand/wood/jungle",
          wood_mangrove: "textures/entity/armor_stand/wood/mangrove",
          wood_oak: "textures/entity/armor_stand/wood/oak",
          wood_pale_oak: "textures/entity/armor_stand/wood/pale_oak",
          wood_spruce: "textures/entity/armor_stand/wood/spruce",
          wood_warped: "textures/entity/armor_stand/wood/warped",
          youtuber_clownpierce:
            "textures/entity/armor_stand/youtuber/clownpierce",
          youtuber_dream: "textures/entity/armor_stand/youtuber/dream",
          youtuber_mr_beast: "textures/entity/armor_stand/youtuber/mrbeast",
          youtuber_technoblade:
            "textures/entity/armor_stand/youtuber/technoblade",
        },
        animations: {
          default_pose: "animation.armor_stand.default_pose",
          no_pose: "animation.armor_stand.no_pose",
          solemn_pose: "animation.armor_stand.solemn_pose",
          athena_pose: "animation.armor_stand.athena_pose",
          brandish_pose: "animation.armor_stand.brandish_pose",
          honor_pose: "animation.armor_stand.honor_pose",
          entertain_pose: "animation.armor_stand.entertain_pose",
          salute_pose: "animation.armor_stand.salute_pose",
          riposte_pose: "animation.armor_stand.riposte_pose",
          zombie_pose: "animation.armor_stand.zombie_pose",
          cancan_a_pose: "animation.armor_stand.cancan_a_pose",
          cancan_b_pose: "animation.armor_stand.cancan_b_pose",
          hero_pose: "animation.armor_stand.hero_pose",
          wiggle: "animation.armor_stand.wiggle",
          "controller.pose": "controller.animation.armor_stand.pose",
          "controller.wiggling": "controller.animation.armor_stand.wiggle",
        },
        scripts: {
          initialize: [
            "variable.armor_stand.pose_index = 0;",
            "variable.armor_stand.hurt_time = 0;",
          ],
          animate: ["controller.pose", "controller.wiggling"],
        },
        geometry: {
          default: "geometry.armor_stand",
          default2: "geometry.armor_stand2",
        },
        render_controllers: [
          "controller.render.armor_stand",
          "controller.render.armor_stand_glowing",
        ],
        enable_attachables: true,
      },
    },
  };

  const texturesObj =
    entityJson["minecraft:client_entity"].description.textures;

  textures.forEach((tex) => {
    if (!texturesObj[tex.name]) {
      texturesObj[tex.name] = `textures/custom_armor_stand/${tex.name}`;
    }

    if (tex.mode === "glowing" && tex.file2) {
      const glowKey = `${tex.name}_glowing`;

      if (!texturesObj[glowKey]) {
        texturesObj[glowKey] = `textures/custom_armor_stand/${glowKey}`;
      }
    }
  });

  const renderJson = {
    format_version: "1.8.0",
    render_controllers: {
      "controller.render.armor_stand": {
        geometry:
          "query.is_name_any('Alex', 'Old alex',  'Clownpierce', 'Luffy', 'Madara', 'Goku', 'Gojo', 'Sed', 'Nx703') ? Geometry.default2 : Geometry.default",
        materials: [
          {
            "*": "Material.default",
          },
        ],
        textures: [
          "query.is_name_any('Gojo') ? Texture.anime_gojo : query.is_name_any('Goku') ? Texture.anime_goku : query.is_name_any('Luffy') ? Texture.anime_luffy : query.is_name_any('Madara') ? Texture.anime_madara : query.is_name_any('Tanjiro') ? Texture.anime_tanjiro : query.is_name_any('Sukuna') ? Texture.anime_sukuna : query.is_name_any('Yuji') ? Texture.anime_yuji : query.is_name_any('Naruto') ? Texture.anime_naruto : query.is_name_any('Dummy') ? Texture.extra_dummy : query.is_name_any('Halloween') ? Texture.extra_halloween : query.is_name_any('Invis') ? Texture.extra_showcase : query.is_name_any('Chad') ? Texture.extra_chad : query.is_name_any('Alex') ? Texture.minecraft_alex : query.is_name_any('Herobrine') ? Texture.minecraft_herobrine : query.is_name_any('Notch') ? Texture.minecraft_notch : query.is_name_any('Old alex') ? Texture.minecraft_old_alex : query.is_name_any('Old steve') ? Texture.minecraft_old_steve : query.is_name_any('Steve') ? Texture.minecraft_steve : query.is_name_any('Alexxander') ? Texture.special_alexxander : query.is_name_any('Amr9445') ? Texture.special_amr9445 : query.is_name_any('Dark') ? Texture.special_darkshadow : query.is_name_any('Keshew') ? Texture.special_keshew : query.is_name_any('Legend') ? Texture.special_legend : query.is_name_any('Lostliano') ? Texture.special_lostliano : query.is_name_any('Nic') ? Texture.special_nic : query.is_name_any('Saif') ? Texture.special_saif : query.is_name_any('Sed') ? Texture.special_sed : query.is_name_any('SuperMario') ? Texture.special_supermario : query.is_name_any('New vietnam') ? Texture.special_newvietnam : query.is_name_any('Nx703') ? Texture.special_nx703 : query.is_name_any('Clownpierce') ? Texture.youtuber_clownpierce : query.is_name_any('Dream') ? Texture.youtuber_dream : query.is_name_any('Mr Beast') ? Texture.youtuber_mr_beast : query.is_name_any('Technoblade') ? Texture.youtuber_technoblade : query.is_name_any('Acacia') ? Texture.wood_acacia : query.is_name_any('Bamboo') ? Texture.wood_bamboo : query.is_name_any('Birch') ? Texture.wood_birch : query.is_name_any('Cherry') ? Texture.wood_cherry : query.is_name_any('Crimson') ? Texture.wood_crimson : query.is_name_any('Dark oak') ? Texture.wood_dark_oak : query.is_name_any('Jungle') ? Texture.wood_jungle : query.is_name_any('Mangrove') ? Texture.wood_mangrove : query.is_name_any('Oak') ? Texture.wood_oak : query.is_name_any('Pale oak') ? Texture.wood_pale_oak : query.is_name_any('Spruce') ? Texture.wood_spruce : query.is_name_any('Warped') ? Texture.wood_warped : Texture.default",
        ],
      },
      "controller.render.armor_stand_glowing": {
        geometry: "Geometry.default",
        materials: [
          {
            "*": "Material.default",
          },
        ],
        textures: [
          "query.is_name_any('Halloween') ? Texture.extra_halloween_glowing : query.is_name_any('Herobrine') ? Texture.minecraft_herobrine_glowing : query.is_name_any('Amr9445') ? Texture.special_amr9445_glowing : query.is_name_any('Dark') ? Texture.special_darkshadow_glowing : query.is_name_any('Keshew') ? Texture.special_keshew_glowing : query.is_name_any('Legend') ? Texture.special_legend_glowing : query.is_name_any('Nic') ? Texture.special_nic_glowing : query.is_name_any('New vietnam') ? Texture.special_newvietnam_glowing : query.is_name_any('Saif') ? Texture.special_saif_glowing : Texture.none",
        ],
        ignore_lighting: true,
      },
    },
  };

  const normalCtrl =
    renderJson.render_controllers["controller.render.armor_stand"];

  const glowCtrl =
    renderJson.render_controllers["controller.render.armor_stand_glowing"];

  let textureStr = normalCtrl.textures[0];
  let geometryStr = normalCtrl.geometry;
  let glowTextureStr = glowCtrl.textures[0];

  textures.forEach((tex) => {
    const name = tex.name;
    const aliases = generateAliases(name)
      .map((a) => `'${a.replace(/'/g, "\\'")}'`)
      .join(", ");

    textureStr =
      `query.is_name_any(${aliases}) ? Texture.${name} : ` + textureStr;

    if (tex.mode === "slim") {
      geometryStr =
        `query.is_name_any(${aliases}) ? Geometry.default2 : ` + geometryStr;
    }

    if (tex.mode === "glowing" && tex.file2) {
      glowTextureStr =
        `query.is_name_any(${aliases}) ? Texture.${name}_glowing : ` +
        glowTextureStr;
    }
  });

  normalCtrl.textures[0] = textureStr;
  normalCtrl.geometry = geometryStr;
  glowCtrl.textures[0] = glowTextureStr;

  zip
    .folder("render_controllers")
    .file(
      "armor_stand.render_controllers.json",
      JSON.stringify(renderJson, null, 2)
    );
  zip
    .folder("entity")
    .file("armor_stand.entity.json", JSON.stringify(entityJson, null, 2));
  const blob = await zip.generateAsync({ type: "blob" });

  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.href = url;
  link.download = `${safeName}.mcpack`;

  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
