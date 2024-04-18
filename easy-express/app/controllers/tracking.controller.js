const db = require("../models");
const uuid = require("uuid");
const axios = require("axios");
const json2csv = require('json2csv').parse;
const fs = require('fs');
const User = db.users;
const ApiKey = db.apiKeys;
const Tracking = db.tracking;
const Op = db.Sequelize.Op;
const ApiKeyUsage = db.apiKeyUsage

exports.quickTracking = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { container_number, bill_of_lading, scac } = req.body;
    let url = 'http://wherecargo.com:31999/api/shipment_request/'
    if(container_number.includes('DEMO')){
      url = 'http://wherecargo.com:31999/api/test_api_request_shipment'
    }
    // axios.get("http://wherecargo.com:31999/api/test_api_request_shipment")
      
    axios
      .post(url, { container_number, bill_of_lading, scac }, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-wherecargo': '8f8ab559-25d6-4c0a-981a-358bd4927879'
        }
      })
      .then(function (response) {
        // handle success
        const data = response.data;
        res.status(200).json({ data });
      })
      .catch(function (error) {
        // handle error
        console.log(error)
        res.status(500).json({ success: false, message: "An Error Occurred" });
      });

    // res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
};

exports.quickTrackingData = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { shipment_id, is_demo } = req.body;

    let url = 'http://wherecargo.com:31999/api/get_shipment/'
    if(is_demo){
      url = 'http://wherecargo.com:31999/api/test_api_get_shipment_status'
    }
    axios
      .post(url, { shipment_id }, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-wherecargo': '8f8ab559-25d6-4c0a-981a-358bd4927879'
        }
      })
      .then(function (response) {
        // handle success
        const data = response.data;
        res.status(200).json({ data });
      })
      .catch(function (error) {
        // handle error
        
        res.status(500).json({ success: false, message: "An Error Occurred" });
      });

    // res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
};

exports.history = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  // try {
    const user = req.body.userTokenBreak;
    const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
    const offset = (pageNumber - 1) * pageSize;
    const data = await Tracking.findAll({
      // paranoid: false,
      include: [
        {
          model: User,
          attributes: [ 'firstName', 'lastName']
        }
      ],
      where: {
        userId: user.userId.toString(),
      },
      order: [
        ['id', 'DESC'],
      ],
      limit: pageSize,
      offset: offset,
    });

    const totalCount = await Tracking.count({
      where: {
        userId: user.userId.toString(),
      },
    }); // Get total count of users
    const totalPages = Math.ceil(totalCount / pageSize); // Calculate total number of pages  

    res.status(200).json({ data, totalPages });
  // } catch (error) {
  //   res.status(500).json({ success: false, message: error });
  // }
};

exports.historyFilter = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  // try {
    const user = req.body.userTokenBreak;
    const {requestStatus, shipmentStatus, shippingLine} = req.body

    const data = await Tracking.findAll({
      include: [
        {
          model: User,
          attributes: [ 'firstName', 'lastName']
        }
      ],
      where: {
        userId: user.userId.toString(),
      },
      order: [
        ['id', 'DESC'],
      ],
    });

    // now filter
    if(requestStatus.length < 1 && shipmentStatus.length < 1 && shippingLine.length < 1){
      const pageNumber = req.query.pageNumber ? parseInt(req.query.pageNumber) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize) : 10;
      const offset = (pageNumber - 1) * pageSize;
      const dataPage = await Tracking.findAll({
        // paranoid: false,
        include: [
          {
            model: User,
            attributes: [ 'firstName', 'lastName']
          }
        ],
        where: {
          userId: user.userId.toString(),
        },
        order: [
          ['id', 'DESC'],
        ],
        limit: pageSize,
        offset: offset,
      });
      const totalCount = await Tracking.count({
        where: {
          userId: user.userId.toString(),
        },
      }); // Get total count of users
      const totalPages = Math.ceil(totalCount / pageSize); // Calculate total number of pages  

      res.status(200).json({ data: dataPage, totalPages });
    }else{
      const filter = data.filter((item) => {
        const decodedData = JSON.parse(item?.response);
        const d = decodedData?.data;
        const r = decodedData?.request;
        return (
          (shippingLine.length > 0
            ? shippingLine
                ?.map((e) => e?.value.toLowerCase())
                .includes(d?.scac?.toLowerCase())
            : true) &&
          (requestStatus.length > 0
            ? requestStatus
                ?.map((e) => e?.value.toLowerCase())
                .includes(r?.status?.toLowerCase())
            : [
                { label: "Success", value: "success" },
                { label: "Pending", value: "pending" },
                { label: "Error", value: "error" },
              ]
                .map((e) => e?.value.toLowerCase())
                .includes(r?.status?.toLowerCase())) &&
          (shipmentStatus.length > 0
            ? shipmentStatus
                ?.map((e) => (e?.value == "active" ? true : false))
                .includes(item?.isActive)
            : [
                { label: "Active", value: "active" },
                { label: "Inactive", value: "inactive" },
              ]
                ?.map((e) => (e?.value == "active" ? true : false))
                .includes(item?.isActive))
        );
      });
      console.log(filter.length)
      res.status(200).json({ data: filter });
    }

   
  // } catch (error) {
  //   res.status(500).json({ success: false, message: error });
  // }
};

exports.getTrackingByTrackingId = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const trackingId = req.params.trackingId;
    const data = await Tracking.findOne({
      where: {
        trackingId: trackingId,
      },
    });

    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
}

exports.deleteTrackingById = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { id } = req.body;
    // const data = await Tracking.findOne({
    //   where: {
    //     id: id,
    //   }
    // })
    // await data.delete()
    const data = await Tracking.destroy({
      where: {
        id: id,
      },
    });

    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
}

exports.latestHistory = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  try {
    const user = req.body.userTokenBreak;
    const data = await Tracking.findAll({
      where: {
        userId: user.userId.toString(),
      },
      // limit: 5,
      order: [
        ['id', 'DESC'],
      ]
      // include: User
    });
    const d = []
    for (let index = 0; index < data.length; index++) {
      const row = data[index];
      const decodedData = JSON.parse(row.response !== "" ? row.response : "{}");
      if(decodedData?.request?.status == 'SUCCESS'){
        d.push(row)
        if(d.length == 5){
          break
        }
      }
      
    }

    res.status(200).json({ data: d });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
};

exports.getTrackingGraphData = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  try {
    const filterType = req.query.type
    const user = req.body.userTokenBreak;
    console.log(filterType)
    let startOfDate = new Date();
    let endOfDate = new Date();
    const currentDate = new Date();

    let filterData = 'month' 
    if(filterType == 'monthly'){
      filterData == 'month'
      startOfDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      endOfDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    }else if(filterType == 'weekly'){
      filterData = 'week'
      startOfDate.setHours(0, 0, 0, 0 - startOfDate.getDay() * 24 * 60 * 60 * 1000);
      endOfDate.setHours(23, 59, 59, 999 - endOfDate.getDay() * 24 * 60 * 60 * 1000);

    }else if(filterType == 'yearly'){
      filterData = 'year'
      startOfDate = new Date(currentDate.getFullYear(), 0, 1);
      endOfDate = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59, 999);
    }else{
      filterData = 'day'
      startOfDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0, 0);
      endOfDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59, 999);

    }

    const data = await Tracking.findAll({
      where: {
        userId: user.userId.toString(),
      },
      attributes: [
        [db.sequelize.fn('date_trunc', filterData, db.sequelize.col('createdAt')), 'createdAt'],
        [db.sequelize.fn('count', db.sequelize.col('*')), 'count'],
      ],
      group: [db.sequelize.fn('date_trunc', filterData, db.sequelize.col('createdAt'))],
      // where: {
      //   createdAt: {
      //     [Op.between]: [startOfDate, endOfDate],
      //   },
      // }
    });
    // console.log(aggregatedDataByMonth);

    res.status(200).json({ data, filterData });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
};

exports.addTracking = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  try {
    const user = req.body.userTokenBreak;
    const { response, containerNumber, isActive, shipmentId } = req.body;
    const apiKey = await ApiKey.findOne({
      where: {
        userId: user.userId.toString(),
        status: "active",
      },
    });

    if(!apiKey){
      res.status(400).json({ success: false, message: 'API key not created, create api key' });
    }

    //update apiKeyUsage
    await ApiKeyUsage.create({
      userId: user.userId.toString(),
      apiKey: apiKey?.apiKey,
      containerNumber: containerNumber,
    })

    //check if container is being tracked
    const check = await Tracking.findOne({
      where: {
        userId: user.userId.toString(),
        containerNumber: containerNumber,
      },
    });

    if (check) {
      check.response = JSON.stringify(response);
      check.apiKey = apiKey?.apiKey;
      check.isActive = isActive ?? false
      check.shipmentId = shipmentId
      await check.save();
      res
        .status(200)
        .json({ message: "Container data updated successfully", data: check });
    } else {
      const data = await Tracking.create({ 
        userId: user.userId.toString(),
        apiKey: apiKey?.apiKey,
        containerNumber: containerNumber,
        response: JSON.stringify(response),
        isActive: isActive ?? false,
        trackingId: uuid.v4(),
        shipmentId: shipmentId
      });
      res
        .status(200)
        .json({ message: "Container data added successfully", data });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
};

exports.addTrackingBulk = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  try {
    const user = req.body.userTokenBreak;
    const { data } = req.body;
    const apiKey = await ApiKey.findOne({
      where: {
        userId: user.userId.toString(),
        status: "active",
      },
    });
    if(!apiKey){
      res.status(400).json({ success: false, message: 'API key not created, create api key' });
    }

    //handle save
    for (let i = 0; i < data.length; i++) {
      const e = data[i];
      //update apiKeyUsage
      
      const response = {
        data: {
          containers: [],
          created_at: "",
          events: [],
          is_active: true,
          port_of_discharge: null,
          port_of_loading: null,
          scac: e[1],

        },
        error: {
          code: 0,
          message: "success"
        },
        id: "",
        request: {
          status: 'PENDING',
          tags: [e[3]],
          tracking_items: {
            bill_of_lading: e[2],
            booking_ref: null,
            container_number: e[0],
            scac: e[1]
          }
        }
      }
      const check = await Tracking.findOne({
        where: {
          userId: user.userId.toString(),
          containerNumber: e[0],
        },
      });
      if (check) {
        check.response = JSON.stringify(response);
        check.apiKey = apiKey?.apiKey;
        check.isActive = true
        await check.save();
      } else {
        await ApiKeyUsage.create({
          userId: user.userId.toString(),
          apiKey: apiKey?.apiKey,
          containerNumber: e[0],
        })
       await Tracking.create({ 
          userId: user.userId.toString(),
          apiKey: apiKey?.apiKey,
          containerNumber: e[0],
          response: JSON.stringify(response),
          isActive: true,
          trackingId: uuid.v4(),
        });
        
      }
      
    }

    res.status(200).json({ message: "Container data added successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
};

exports.exportTrackingData = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  try {
    const user = req.body.userTokenBreak;
    const data = await Tracking.findAll({
      // paranoid: false,
      where: {
        userId: user.userId.toString(),
      },
      // include: User
    });
    if(data.length < 1){
      res.status(500).json({ success: false, message: 'No data found' });
    }
    const jsonData = data.map(d => d.toJSON());
    const csv = json2csv(jsonData);
    fs.writeFileSync('data.csv', csv);
    console.log('CSV file created successfully!');

    res.status(200).json({ data: csv });
    // res.set('Content-Type', 'text/csv');
    // res.set('Content-Disposition', 'attachment; filename="users.csv"');

    // // Send CSV data as response
    // res.send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
}

exports.updateTags = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  const user = req.body.userTokenBreak;
  const { tag, trackingId } = req.body;
  const data = await Tracking.findOne({
    where: {
      trackingId: trackingId,
    },
  });
  if(data){
    const resp = JSON.parse(data?.response);
    resp.request.tags = [tag]

    data.response = JSON.stringify(resp)
    await data.save();
    res.status(200).json({ message: "Container tag updated successfully" });
  }else{
    res.status(500).json({ success: false, message: 'Tracking not found' });
  }
  
}

exports.trackingCronJob = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {

    const tracking = await Tracking.findAll()
    let isUpdated = false
    for (let i = 0; i < tracking.length; i++) {
      const row = tracking[i];
      const decodedData = JSON.parse(row.response !== "" ? row.response : "{}");
      if(decodedData?.request?.status == 'PENDING' || decodedData?.request?.status == 'IN_PROGRESS'){
        if(row?.shipmentId == null){
          let url = 'http://wherecargo.com:31999/api/shipment_request/'
          await axios
            .post(url, { container_number: row?.containerNumber }, {
              headers: {
                'Content-Type': 'application/json',
                'x-auth-wherecargo': '8f8ab559-25d6-4c0a-981a-358bd4927879'
              }
            })
            .then(async function (response) {
              // handle success
              const data = response.data;
              // res.status(200).json({ success: false, data});
              let shipment_id = data?.id

              let url = 'http://wherecargo.com:31999/api/get_shipment/'
              await axios
                .post(url, { shipment_id }, {
                  headers: {
                    'Content-Type': 'application/json',
                    'x-auth-wherecargo': '8f8ab559-25d6-4c0a-981a-358bd4927879'
                  }
                })
                .then(async function (response) {
                  // handle success
                  const trackingData = response.data;
                  const addData = {
                    response: trackingData,
                    containerNumber: trackingData?.request?.tracking_items?.container_number,
                    isActive: trackingData?.data?.data?.is_active ?? true,
                    shipmentId: shipment_id
                  };

                  const check = await Tracking.findOne({
                    where: {
                      userId: row.userId.toString(),
                      containerNumber: trackingData?.request?.tracking_items?.container_number,
                    },
                  });

                  const apiKey = await ApiKey.findOne({
                    where: {
                      userId: row.userId.toString(),
                      status: "active",
                    },
                  });
              
                  if (check) {
                    check.response = JSON.stringify(addData?.response);
                    check.apiKey = apiKey?.apiKey;
                    check.isActive = trackingData?.data?.data?.is_active ?? false,
                    check.shipmentId = shipment_id
                    await check.save();
                    // res
                    //   .status(200)
                    //   .json({ message: "Container data updated successfully", data: check });
                    isUpdated = true
                  } else {
                    const data = await Tracking.create({ 
                      userId: row.userId.toString(),
                      apiKey: apiKey?.apiKey,
                      containerNumber: addData?.containerNumber,
                      response: JSON.stringify(addData?.response),
                      isActive: addData?.isActive ?? false,
                      trackingId: uuid.v4(),
                      shipmentId: addData?.shipmentId
                    });
                    isUpdated = true

                    // res
                    //   .status(200)
                    //   .json({ message: "Container data added successfully", data });
                  }
                })
                .catch(function (error) {
                  // handle error
                  console.log(error)
                  isUpdated = false
                  // return res.status(500).json({ success: false, message: error });
                });
            })
            .catch(function (error) {
              // handle error
              // console.log(error)
              isUpdated = false

            //  return res.status(500).json({ success: false, message: error });
            });
        }else{
          let shipment_id = row?.shipmentId

          let url = 'http://wherecargo.com:31999/api/get_shipment/'
          await axios
            .post(url, { shipment_id }, {
              headers: {
                'Content-Type': 'application/json',
                'x-auth-wherecargo': '8f8ab559-25d6-4c0a-981a-358bd4927879'
              }
            })
            .then(async function (response) {
              // handle success
              const trackingData = response.data;
              const addData = {
                response: trackingData,
                containerNumber: trackingData?.request?.tracking_items?.container_number,
                isActive: trackingData?.data?.data?.is_active ?? true,
                shipmentId: shipment_id
              };

              const check = await Tracking.findOne({
                where: {
                  userId: row.userId.toString(),
                  containerNumber: trackingData?.request?.tracking_items?.container_number,
                },
              });

              const apiKey = await ApiKey.findOne({
                where: {
                  userId: row.userId.toString(),
                  status: "active",
                },
              });
          
              if (check) {
                check.response = JSON.stringify(addData?.response);
                check.apiKey = apiKey?.apiKey;
                check.isActive = trackingData?.data?.data?.is_active ?? false,
                check.shipmentId = shipment_id
                await check.save();
                isUpdated = true
                // return res
                //   .status(200)
                //   .json({ message: "Container data updated successfully", data: check });
              } else {
                const data = await Tracking.create({ 
                  userId: row.userId.toString(),
                  apiKey: apiKey?.apiKey,
                  containerNumber: addData?.containerNumber,
                  response: JSON.stringify(addData?.response),
                  isActive: addData?.isActive ?? false,
                  trackingId: uuid.v4(),
                  shipmentId: addData?.shipmentId
                });
                isUpdated = true

                // return res
                //   .status(200)
                //   .json({ message: "Container data added successfully", data });
              }
            })
            .catch(function (error) {
              isUpdated = false
              // handle error
              // console.log(error)
              // return res.status(500).json({ success: false, message: error });
            });
        }
        break;
      }
      
    }
    return res.status(200).json({ success: false, message: isUpdated ? 'Container updated' : 'No data found' });

    // const { container_number, bill_of_lading, scac } = req.body;
    // let url = 'http://wherecargo.com:31999/api/shipment_request/'
    // if(container_number.includes('DEMO')){
    //   url = 'http://wherecargo.com:31999/api/test_api_request_shipment'
    // }
    // // axios.get("http://wherecargo.com:31999/api/test_api_request_shipment")
      
    // axios
    //   .post(url, { container_number, bill_of_lading, scac }, {
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'x-auth-wherecargo': '8f8ab559-25d6-4c0a-981a-358bd4927879'
    //     }
    //   })
    //   .then(function (response) {
    //     // handle success
    //     const data = response.data;
    //     res.status(200).json({ data });
    //   })
    //   .catch(function (error) {
    //     // handle error
    //     console.log(error)
    //     res.status(500).json({ success: false, message: "An Error Occurred" });
    //   });

    // res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
};
