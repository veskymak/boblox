# Avatars and shop (v9.4)

AvatarAndShop.js owns SHOP_ITEMS/SHOP_ITEM_MAP, avatarOutfit, ownedShopItems, avatar rendering, headshot cache and shop preview. Its visual catalog is mirrored in data/shop-catalog.json and the private server catalog; server pricing must stay aligned with the checked-in catalog.

buyShopItem is async for authenticated users: it sends purchase(itemId), waits for a committed server snapshot, then renders the purchased/equipped item. It never decrements authenticated coins or grants ownership locally. Outfit/torso changes use profile sync and server ownership checks. Guest purchases remain local practice and do not transfer to registered accounts.

disposeObject3D delegates to SceneResources, which deduplicates references and preserves cached/shared geometry, materials and textures. closeShopModal cancels its preview frame, disposes the preview scene/renderer and clears references; reopening recreates them. Headshot cache invalidation remains required after outfit changes.

Seams: buyShopItem, equipShopItem, saveShopState, disposeObject3D, closeShopModal. Preserve existing avatar slots, DOM IDs, mobile hit targets and Bobux color text-[#FFE066].
