import GLProgram from "../../lib/webgl/GLProgram";
import OrbitControls from "../../lib/controls/OrbitControls";


// Class made to pass the butter
class WindowManager {
    constructor(id_panel, id_canvas) {
        this.gl = null;
        this.initialized = 0;
        this.pos_mouse = new THREE.Vector2();
        this.is_mouse_in = 0;

        this.id_panel = id_panel;
        this.id_canvas = id_canvas;

        this.measure();

        this.z_near = 0.5;
        this.z_far = 50.0;
    }


    measure() {
        this.container = document.getElementById(this.id_panel);
        this.canvas = document.getElementById(this.id_canvas);

        // this.canvas.addEventListener("webglcontextlost", (event) => {console.log("lost context");}, false);

        this.window_width = Math.round(this.container.getBoundingClientRect().width);
        this.window_height = Math.round(this.container.getBoundingClientRect().height);
        this.window_left = Math.round(this.container.getBoundingClientRect().left);
        this.window_top = Math.round(this.container.getBoundingClientRect().top);
        // this.window_ar = this.window_height/this.window_width;
        this.window_ar = this.window_width/this.window_height;

        this.mouseenter_ref = this.mouseenter.bind(this);
        this.mouseleave_ref = this.mouseleave.bind(this);
        this.container.addEventListener('mouseenter', this.mouseenter_ref, false);
        this.container.addEventListener('mouseleave', this.mouseleave_ref, false);

        this.canvas.left = Math.floor(this.window_left);
        this.canvas.top = Math.floor(this.window_top);
        this.canvas.width = Math.floor(this.window_width);
        this.canvas.height = Math.floor(this.window_height);
    }


    reinit() {
        this.measure();
        this.init();
    }

    init() {
        // this.gl = GLProgram.init_webgl(this.canvas);
        this.init_camera();
        this.init_navigation();
    }

    advance(i_iteration, mspf) {
        this.navigation.update(mspf*0.001);
        this.camera.updateMatrixWorld(true);
    }

    init_camera() {
        // -> view/projection
        this.projection_matrix = new THREE.Matrix4();
        // const factor = 0.25;
        const factor = 1;
        this.projection_matrix.makePerspective(-factor*1.0, factor*1.0, factor/this.window_ar, -factor/this.window_ar, this.z_near, this.z_far);

        // this.camera = new THREE.PerspectiveCamera();
        this.camera = new THREE.PerspectiveCamera(45, this.window_width / this.window_height, 0.1, 1000);

        this.camera.position.set(0, -10, 5);
        this.camera.up = new THREE.Vector3(0, 0, 1);

        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.camera.updateMatrixWorld(true);
        console.log(this.get_camera_intrinsics())
        // <-
    }

    set_view(pos, up, look_at) {
        this.camera.position.set(pos.x, pos.y, pos.z);
        up.normalize();
        this.camera.up.set(up.x, up.y, up.z);
        this.camera.lookAt(look_at);
        this.navigation.target.set(look_at.x, look_at.y, look_at.z);
        this.navigation.update()
        this.camera.updateMatrixWorld(true);
    }

    init_navigation() {
        // -> navigation
        // this.navigation_fly = new FPFlyControls(this.camera, this.window_width, this.window_height, this.window_left, this.window_top);
        this.navigation_orbit = new OrbitControls(this.camera, this.container);
        this.navigation = this.navigation_orbit;
        // <-
    }

    set_camera_pos_and_lookat(pos, lookat) {
        this.camera.position.set(pos.x, pos.y, pos.z);
        this.camera.up = new THREE.Vector3(0, 1, 0);
        this.navigation.target = lookat;
        this.navigation.controls.update();
        this.camera.updateMatrixWorld(true);
    }

    set_camera_pos_and_lookat_to_default() {
        this.camera.position.set(5, 5, -5);
        this.camera.up = new THREE.Vector3(0, 1, 0);
        this.navigation.target = new THREE.Vector3(0, 0, 0);
        this.camera.updateMatrixWorld(true);
    }

    get_camera_pos() {
        return this.camera.position;
    }

    get_camera_intrinsics() {
        return (new THREE.Matrix3()).set(
            this.camera.getFocalLength(), 0,                            this.camera.getFilmWidth()/2,
            0,                            this.camera.getFocalLength(), this.camera.getFilmHeight()/2,
            0,                            0,                            1
        )
    }


    /********************************************
     *************  Event handlers  *************
     ********************************************/
    mousemove(event) {
        // if (this.is_mouse_in_model_panel()) {
            this.pos_mouse.x = ((event.clientX - this.window_left) / this.canvas.width) * 2 - 1;
            this.pos_mouse.y = - ((event.clientY - this.window_top) / this.canvas.height) * 2 + 1;
            this.navigation.mousemove(event);
        // }
    }

    mousedown(event) {
        // if (this.is_mouse_in_model_panel()) 
        this.navigation.mousedown(event);
    }

    mouseup(event) {
        // if (this.is_mouse_in_model_panel()) 
        this.navigation.mouseup(event);
    }

    mousewheel(event) {
        // if (this.is_mouse_in_model_panel()) 
        this.navigation.mousewheel(event);
    }

    contextmenu(event) {
        this.navigation.contextmenu(event);
    }

    get_pos_mouse() {
        return this.pos_mouse;
    }

    get_relative_pos(pos) {
        /*
            Returns mouse position relative to window
            Expects pos: THREE.Vector2( event.clientX, event.clientY)
        */
        return new THREE.Vector2(pos.x - this.window_left, pos.y - this.window_top);
    }

    on_window_resize(event) {
        this.measure();
        this.camera.aspect = this.window_width/this.window_height;
        this.camera.updateProjectionMatrix(true);
    };


    mouseenter(event) {
        this.is_mouse_in = true;
    }

    mouseleave(event) {
        this.is_mouse_in = false;
    }

    is_mouse_in_model_panel() {
        return this.is_mouse_in;
    }


    add_listener(event_tag, event_callback) {
        if (event_tag === "mousemove")
            this.container.parentNode.addEventListener( event_tag, event_callback, false );
        else if (event_tag === "resize")
            window.addEventListener(event_tag, event_callback)
        else
            this.container.addEventListener( event_tag, event_callback, false );
    }

    remove_listener(event_tag, event_callback) {
        if (event_tag === "mousemove")
            this.container.parentNode.removeEventListener( event_tag, event_callback, false );
        else if (event_tag === "resize")
            window.removeEventListener(event_tag, event_callback)
        else
            this.container.removeEventListener( event_tag, event_callback, false );
    }

    clear(){
        this.gl.clearColor(255/255.0, 255/255.0, 254/255.0, 1.0);  // Clear to black, fully opaque
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }


    /**********************************************
    ***********  Projection Functions  ************
    ***********************************************/
    project_position_to_clipspace(pos0) {
        let pos = new THREE.Vector4(pos0.x, pos0.y, pos0.z, 1.0);
        pos.applyMatrix4(this.camera.matrixWorldInverse);
        pos.applyMatrix4(this.projection_matrix);
        pos.multiplyScalar(1.0/pos.w);
        return pos;
    }

    project_position_to_screen(pos0) {
        let pos = new THREE.Vector4(pos0.x, pos0.y, pos0.z, 1.0);
        pos.applyMatrix4(this.camera.matrixWorldInverse);
        pos.applyMatrix4(this.projection_matrix);
        pos.multiplyScalar(1.0/pos.w);
        pos.x = (pos.x + 1.0)*0.5*this.window_width;
        pos.y = (-pos.y + 1.0)*0.5*this.window_height;
        return pos;
    }

    project_ndc_to_world(pos0) {
        let pos = new THREE.Vector4(pos0.x, pos0.y, pos0.z, 1.0);
        const projection_view_inv = new THREE.Matrix4();
        projection_view_inv.premultiply(this.camera.matrixWorldInverse);
        projection_view_inv.premultiply(this.projection_matrix);
        projection_view_inv.getInverse(projection_view_inv);
        pos.applyMatrix4(projection_view_inv);
        pos.multiplyScalar(1.0/pos.w);
        return pos;
    }

    project_ndc_to_screen(pos0) {
        let pos = new THREE.Vector2();
        pos.x = (pos0.x + 1.0)*this.window_width*0.5;
        pos.y = (-pos0.y + 1.0)*this.window_height*0.5;
        return pos;
    }

    project_screen_to_ndc(pos0) {
        let pos = new THREE.Vector2();
        pos.x = pos0.x/this.window_width*2.0 - 1.0;
        pos.y = -pos0.y/this.window_height*2.0 + 1.0;
        return pos;
    }

    project_depth_to_ndc(depth0) {
        return depth0/(this.z_far - this.z_near)*2.0 - 1.0;
    }

    project_linear_depth_to_nonlinear_depth(depth) {
        let z_delta = this.z_far - this.z_near;
        let depth_nonlinear = (this.z_far + this.z_near -2.0*this.z_near*this.z_far/depth)/z_delta;
        return depth_nonlinear;
    }

}

export default WindowManager;
