import { Request, Response } from "express";
import { getRepository } from "typeorm";
import orphanageView from "../views/orphaneges_view";
import Orphanage from "../models/Orphanage";
import * as Yup from "yup";

export default {
  async index(request: Request, response: Response) {
    const orphanagesRepository = getRepository(Orphanage);

    const orphanages = await orphanagesRepository.find({
      relations: ["images"],
    });

    return response.json(orphanageView.renderMany(orphanages));
  },

  async show(request: Request, response: Response) {
    const { id } = request.params;

    const orphanagesRepository = getRepository(Orphanage);

    const orphanage = await orphanagesRepository.findOneOrFail(id, {
      relations: ["images"],
    });

    return response.json(orphanageView.render(orphanage));
  },

  async create(request: Request, response: Response) {
    // console.log(request.body);
    const {
      name,
      latidude,
      longitude,
      about,
      instructions,
      openign_hours,
      open_on_weekends,
    } = request.body;

    const orphanagesRepository = getRepository(Orphanage);

    // pegando as imagem (as forçando que é um array de arquivos)
    const requestImages = request.files as Express.Multer.File[];

    // pegorrendo as imagem map cada uma das imagem e retora o objeto
    const images = requestImages.map((image) => {
      return { path: image.filename };
    });

    const data = {
      name,
      latidude,
      longitude,
      about,
      instructions,
      openign_hours,
      open_on_weekends,
      images,
    };
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      latidude: Yup.number().required(),
      longitude: Yup.number().required(),
      about: Yup.string().required(),
      instructions: Yup.string().required(),
      openign_hours: Yup.string().required(),
      open_on_weekends: Yup.boolean().required(),
      images: Yup.array(
        Yup.object().shape({
          path: Yup.string().required(),
        })
      ),
    });

    console.log(data.openign_hours);

    await schema.validate(data, {
      abortEarly: false,
    });

    const orphanage = orphanagesRepository.create(data);

    await orphanagesRepository.save(orphanage);

    return response.status(201).json(orphanage);
  },
};
