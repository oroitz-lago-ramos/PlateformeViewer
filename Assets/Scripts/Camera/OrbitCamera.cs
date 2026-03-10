using UnityEngine;

/// <summary>
/// Orbit camera controller for architectural/blueprint visualization.
/// - Left mouse drag  : orbit (yaw + pitch) around pivot
/// - Scroll wheel     : zoom in/out
/// - Middle mouse drag: pan pivot point
/// - R key            : reset to default view
/// </summary>
public class OrbitCamera : MonoBehaviour
{
    [Header("Target")]
    [Tooltip("The transform the camera orbits around. Leave null to use DefaultPivot.")]
    public Transform target;
    public Vector3 targetOffset = Vector3.zero;

    [Header("Orbit")]
    public float orbitSpeed = 5f;
    [Range(-90f, 0f)] public float minPitch = 5f;
    [Range(0f, 90f)]  public float maxPitch = 85f;
    public float startYaw = 45f;
    public float startPitch = 35f;

    [Header("Zoom")]
    public float zoomSpeed = 5f;
    public float minZoom = 3f;
    public float maxZoom = 150f;
    public float defaultZoom = 20f;

    [Header("Pan")]
    public float panSpeed = 0.3f;

    [Header("Smoothing")]
    [Range(0.01f, 0.3f)] public float smoothTime = 0.08f;

    // --- current smoothed state ---
    private float _yaw;
    private float _pitch;
    private float _distance;
    private Vector3 _pivot;

    // --- target state ---
    private float _targetYaw;
    private float _targetPitch;
    private float _targetDistance;
    private Vector3 _targetPivot;
    private Vector3 _defaultPivot;

    // --- smooth-damp velocities ---
    private float _yawVel;
    private float _pitchVel;
    private float _distVel;

    void Start()
    {
        _defaultPivot = target != null ? target.position + targetOffset : targetOffset;

        _targetYaw      = startYaw;
        _targetPitch    = startPitch;
        _targetDistance = defaultZoom;
        _targetPivot    = _defaultPivot;

        // Snap immediately without smoothing
        _yaw      = _targetYaw;
        _pitch    = _targetPitch;
        _distance = _targetDistance;
        _pivot    = _targetPivot;

        ApplyTransform();
    }

    void LateUpdate()
    {
        HandleOrbit();
        HandleZoom();
        HandlePan();
        HandleReset();
        SmoothAndApply();
    }

    // ------------------------------------------------------------------ input

    void HandleOrbit()
    {
        if (!Input.GetMouseButton(0)) return;
        _targetYaw   += Input.GetAxis("Mouse X") * orbitSpeed;
        _targetPitch -= Input.GetAxis("Mouse Y") * orbitSpeed;
        _targetPitch  = Mathf.Clamp(_targetPitch, minPitch, maxPitch);
    }

    void HandleZoom()
    {
        float scroll = Input.GetAxis("Mouse ScrollWheel");
        if (Mathf.Abs(scroll) < 0.0001f) return;
        // Scale zoom delta by current distance so it feels linear at any range
        _targetDistance -= scroll * zoomSpeed * (_targetDistance * 0.25f);
        _targetDistance  = Mathf.Clamp(_targetDistance, minZoom, maxZoom);
    }

    void HandlePan()
    {
        if (!Input.GetMouseButton(2)) return;
        float scale = panSpeed * (_distance / 10f);
        Vector3 right = transform.right * (-Input.GetAxis("Mouse X") * scale);
        Vector3 up    = transform.up    * (-Input.GetAxis("Mouse Y") * scale);
        _targetPivot += right + up;
    }

    void HandleReset()
    {
        if (Input.GetKeyDown(KeyCode.R))
            ResetView();
    }

    // --------------------------------------------------------------- smoothing

    void SmoothAndApply()
    {
        _yaw      = Mathf.SmoothDampAngle(_yaw,      _targetYaw,      ref _yawVel,   smoothTime);
        _pitch    = Mathf.SmoothDamp     (_pitch,    _targetPitch,    ref _pitchVel, smoothTime);
        _distance = Mathf.SmoothDamp     (_distance, _targetDistance, ref _distVel,  smoothTime);
        _pivot    = Vector3.Lerp         (_pivot,    _targetPivot,    Time.deltaTime / Mathf.Max(smoothTime, 0.001f));

        ApplyTransform();
    }

    void ApplyTransform()
    {
        Quaternion rotation = Quaternion.Euler(_pitch, _yaw, 0f);
        Vector3    position = _pivot - rotation * Vector3.forward * _distance;
        transform.SetPositionAndRotation(position, rotation);
    }

    // ----------------------------------------------------------- public API

    /// <summary>Smoothly move the pivot to <paramref name="point"/>.</summary>
    public void FocusOn(Vector3 point, float distance = -1f)
    {
        _targetPivot = point;
        if (distance > 0f)
            _targetDistance = Mathf.Clamp(distance, minZoom, maxZoom);
    }

    /// <summary>Return to the default view defined in the inspector.</summary>
    public void ResetView()
    {
        _targetPivot    = _defaultPivot;
        _targetDistance = defaultZoom;
        _targetYaw      = startYaw;
        _targetPitch    = startPitch;
    }

    // ----------------------------------------------------------- web settings

    /// <summary>Called from the web client via SendMessage.</summary>
    public void SetOrbitSpeed(float v)  { orbitSpeed  = Mathf.Max(0.1f, v); }
    public void SetPanSpeed(float v)    { panSpeed    = Mathf.Max(0.01f, v); }
    public void SetZoomSpeed(float v)   { zoomSpeed   = Mathf.Max(0.1f, v); }
    public void SetSmoothTime(float v)  { smoothTime  = Mathf.Clamp(v, 0.01f, 0.3f); }
}
