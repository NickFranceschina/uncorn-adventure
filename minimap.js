import * as THREE from 'three';

export function setupMinimap(scene, character) {
    const minimapScene = new THREE.Scene();
    minimapScene.background = new THREE.Color(0x2D5A27);

    // Create player marker group (centered)
    const playerMarkerGroup = new THREE.Group();
    minimapScene.add(playerMarkerGroup);

    // Main triangle body (white triangle pointing up)
    const playerMarker = new THREE.Mesh(
        new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(0, 1.5, 0),     // tip (front)
            new THREE.Vector3(-0.6, -0.5, 0), // left base - wider than before (was -0.4)
            new THREE.Vector3(0.6, -0.5, 0),  // right base - wider than before (was 0.4)
        ]).setIndex([0, 1, 2]),
        new THREE.MeshBasicMaterial({ 
            color: 0xFFFFFF,
            side: THREE.DoubleSide
        })
    );
    playerMarker.rotation.x = -Math.PI / 2;
    playerMarker.rotation.z = Math.PI;
    playerMarker.position.y = 0.1;
    playerMarkerGroup.add(playerMarker);

    // Setup renderer
    const minimapRenderer = new THREE.WebGLRenderer({
        alpha: false,  // Change to false since we want solid background
        antialias: true
    });
    minimapRenderer.setSize(150, 150);  // Match CSS size
    minimapRenderer.setClearColor(0x2D5A27, 1);
    minimapRenderer.setViewport(0, 0, 150, 150);  // Match size

    // Create orthographic camera with adjusted bounds
    const minimapCamera = new THREE.OrthographicCamera(
        -8, 8,    // Reduce the bounds to zoom in more
        8, -8,    // Keep the view more focused
        0.1, 1000
    );
    minimapCamera.position.set(0, 10, 0);  // Lower the camera height
    minimapCamera.lookAt(new THREE.Vector3(0, 0, 0));

    // Setup minimap DOM element
    let minimapElement = document.getElementById('minimap');
    if (!minimapElement) {
        minimapElement = document.createElement('div');
        minimapElement.id = 'minimap';
        document.body.appendChild(minimapElement);
    }
    minimapElement.innerHTML = '';
    minimapElement.appendChild(minimapRenderer.domElement);

    // Function to create markers for objects
    function createMinimapMarker(color) {
        const marker = new THREE.Mesh(
            new THREE.CircleGeometry(0.4, 16),
            new THREE.MeshBasicMaterial({ 
                color: color,
                side: THREE.DoubleSide
            })
        );
        marker.rotation.x = -Math.PI / 2;
        return marker;
    }

    function updateMinimap(cupcakeGroup, bubbleGroup) {
        // Keep player marker centered and rotate correctly
        playerMarkerGroup.position.set(0, 0, 0);
        playerMarkerGroup.rotation.y = character.rotation.y;

        // Update camera to always look at center
        minimapCamera.position.set(0, 10, 0);
        minimapCamera.lookAt(0, 0, 0);

        // Clear existing markers
        minimapScene.children.forEach(child => {
            if (child !== playerMarkerGroup) {
                minimapScene.remove(child);
            }
        });

        // Add markers for cupcakes with relative positions
        cupcakeGroup?.children.forEach(cupcake => {
            if (!cupcake.userData.collected) {
                const marker = createMinimapMarker(0xFF69B4);
                marker.position.x = cupcake.position.x + cupcakeGroup.position.x - character.position.x;
                marker.position.z = cupcake.position.z + cupcakeGroup.position.z - character.position.z;
                marker.position.y = 0.1;
                minimapScene.add(marker);
            }
        });

        // Add markers for bubbles with relative positions
        bubbleGroup?.children.forEach(bubble => {
            if (!bubble.userData.collected) {
                const marker = createMinimapMarker(0x00FFFF);
                marker.position.x = bubble.position.x + bubbleGroup.position.x - character.position.x;
                marker.position.z = bubble.position.z + bubbleGroup.position.z - character.position.z;
                marker.position.y = 0.1;
                minimapScene.add(marker);
            }
        });

        minimapRenderer.render(minimapScene, minimapCamera);
    }

    return { updateMinimap };
} 