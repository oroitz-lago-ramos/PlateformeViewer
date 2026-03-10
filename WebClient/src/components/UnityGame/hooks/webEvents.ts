/**
 * Type-safe constants for Unity ↔ Web communication.
 *
 * Unity → Web: Unity calls these event names via its React.jslib.
 * Web → Unity: Use sendMessage(RECEIVER_OBJECT, methodName, data) with these constants.
 *
 * No handlers are wired yet — add them in UnityGame.tsx as needed.
 */

export const WebEvents = {
    // Target GameObject in Unity that receives Web → Unity messages
    RECEIVER_OBJECT: 'WebInteraction',
} as const;
